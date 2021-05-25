var app = new Vue({
    el: "#logApp",
    data() {
        return {
            // base
            // baseURL: "http://127.0.0.1:8000/api",
            // baseURL: "http://192.168.57.17:65517",
            // baseURL: "http://192.168.57.122:65517",
            baseURL: 'http://124.71.207.110:65517',

            // 是否超级管理员
            isSuperuser: '',
            // 用户名
            userName: '',
            // 验证码
            valid: '',

            // 表单数据
            formData: {
                'operationName': '',
                'ip': '',
                'createTime': '',
                'operation': '',
                'parameter': '',
            },

            // 表格数据
            tableData: [],
            currentPageData: [],
            currentpage: 1,
            pagesize: 15,
            total: 0,
        }
    },
    mounted() {
        this.checkIsSuperuser();
        this.getAllDataFromBack();
        if (this.isSuperuser == true) {
            // 普通用户检查是否有新的审查
            this.timer = setInterval(this.checkNewApplication, 2 * 1000 + 200);
        } else {
            // 超级管理员检查是否有新的申请
            this.timer = setInterval(this.checkNewApplicationSuperuser, 2 * 1000 + 200);
        }
    },
    methods: {
        // 跳转至index
        jumpToIndex: function () {
            location.href = 'index.html';
        },

        // 跳转至applicationInfo
        jumpToApplicationInfo: function () {
            location.href = 'applicationInfo.html';
        },

        // 跳转至log
        jumpToLog: function () {
            location.href = 'log.html';
        },

        // 定时检查是否有新的审批
        checkNewApplication() {
            let _this = this;
            axios.post(_this.baseURL + '/timing/check/user/', JSON.stringify({"userName": _this.userName}))
                .then(response => {
                    if (response.data.code === 200) {
                        if (response.data.count > 0) {
                            _this.$notify.info({
                                title: '提示',
                                message: '您收到了新的申请结果。您可以<a href="./applicationInfo.html">点击查看</a>申请结果。',
                                showClose: true,
                                duration: 0,
                                dangerouslyUseHTMLString: true,
                            });
                            // setTimeout(() => {
                            //     location.href = 'index.html';
                            // }, 5 * 1000);
                        }
                    } else {
                        console.log(response.data);
                    }
                })
                .catch(error => {
                    console.log(error);
                })
        },

        // 定时检查是否有新的申请
        checkNewApplicationSuperuser() {
            let _this = this;
            axios.get(_this.baseURL + '/timing/check/superuser/')
                .then(response => {
                    if (response.data.code === 200) {
                        if (response.data.count > 0) {
                            _this.$notify.info({
                                title: '提示',
                                message: '您收到了新的审批申请,可以<a href="./applicationInfo.html">点击查看</a>审批详情',
                                showClose: true,
                                duration: 0,
                                dangerouslyUseHTMLString: true,
                            });
                        }
                        if (response.data.upload != 0) {
                            if (response.data.upload > 0) {
                                _this.$notify.success({
                                    title: '提示',
                                    message: '您有新的文件上传结果可以查看,可以<a href="./index.html">刷新</a>页面',
                                    showClose: true,
                                    duration: 0,
                                    dangerouslyUseHTMLString: true,
                                });
                            } else if (response.data.upload < 0) {
                                _this.$notify.error({
                                    title: '提示',
                                    message: '文件上传出错',
                                    showClose: true,
                                    duration: 0,
                                    dangerouslyUseHTMLString: true,
                                });
                            }
                        }
                    } else {
                        console.log(response.data.msg);
                    }
                })
                .catch(error => {
                    console.log(error);
                })
        },

        // 从cookie中获取是否位超级管理员
        checkIsSuperuser: function () {
            var isSuperuserNum = this.getCookie('isSuperuser');
            if (isSuperuserNum === 1 || isSuperuserNum === '1') {
                this.isSuperuser = false;
            } else {
                this.isSuperuser = true;
            }

            // 更改用户名
            this.userName = this.getCookie('userName');

            // 如果cookie中没有值，则重返登录页面
            if (isSuperuserNum == '' || this.userName == '') {
                location.href = 'login.html';
            }

            // 如果普通用户请求访问此页面，则跳回index
            if (this.isSuperuser == true) {
                location.href = 'index.html';
            }
        },

        // 获取cookie
        getCookie: function (name) {
            var strcookie = document.cookie;//获取cookie字符串
            var arrcookie = strcookie.split("; ");//分割
            //遍历匹配
            for (var i = 0; i < arrcookie.length; i++) {
                var arr = arrcookie[i].split("=");
                if (arr[0] == name) {
                    return arr[1];
                }
            }
            return "";
        },

        // 更改表格行的颜色
        tableRowClassName: function ({row, rowIndex}) {
            if (row.operation == '登录') {
                return 'login-row';
            } else if (row.operation == '查询') {
                return 'query-row';
            } else if (row.operation == '申请') {
                return 'apply-row';
            } else if (row.operation == '审批') {
                return 'check-row';
            } else if (row.operation == '日志') {
                return 'log-row';
            } else if (row.operation == '下载') {
                return 'download-row';
            } else if (row.operation == '上传') {
                return 'upload-row';
            }
            return '';
        },

        // 获取表格所有数据
        getAllDataFromBack: function () {
            let _this = this;
            axios.post(_this.baseURL + '/operation/all/', JSON.stringify({"userName": _this.userName}))
                .then(response => {
                    if (response.data.code === 200) {
                        _this.total = response.data.data.length;
                        _this.tableData = response.data.data;
                        _this.getCurrentPage();
                        _this.$message.success('读取数据成功');
                    } else {
                        _this.$message.error(response.data.msg);
                    }
                })
                .catch(error => {
                    _this.$message.error(error);
                })
        },

        // 获取查询后的数据
        getQueryDataFromBack: function () {
            let _this = this;
            var operationName = _this.formData.operationName;
            var ip = _this.formData.ip;
            var createTime = _this.formData.createTime;
            if (createTime != '') {
                createTime = _this.formatDate(createTime);
            }
            console.log(createTime);
            var operation = _this.formData.operation;
            var parameter = _this.formData.parameter;
            var userName = _this.userName;
            var data = {
                "operationName": operationName,
                "ip": ip,
                "createTime": createTime,
                "operation": operation,
                "parameter": parameter,
                "userName": userName
            };
            console.log(data)
            axios.post(_this.baseURL + '/operation/query/', JSON.stringify(data))
                .then(response => {
                    _this.total = response.data.data.length;
                    _this.tableData = response.data.data;
                    _this.getCurrentPage();
                    _this.$message.success('读取数据成功');
                })
                .catch(error => {
                    _this.$message.error(error)
                });
        },

        // 获取当前页数据
        getCurrentPage: function () {
            let _this = this;
            // 清空当前页数据
            _this.currentPageData = [];
            //获取当前页数据
            for (let i = (_this.currentpage - 1) * _this.pagesize; i < _this.total; i++) {
                _this.currentPageData.push(_this.tableData[i]);
                if (_this.currentPageData.length === _this.pagesize) break;
            }
        },

        // 格式化日期
        formatDate: function (date) {
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            if (month < 10) {
                month = '0' + month.toString();
            }
            var day = date.getDate();
            if (day < 10) {
                day = '0' + day.toString();
            }
            return year + '-' + month + '-' + day;
        },

        //分页行数
        handleSizeChange: function (size) {
            this.pagesize = size;
        },

        //分页页码
        handleCurrentChange: function (currentPage) {
            this.currentpage = currentPage;
            this.getCurrentPage();
        },

        //清除cookie
        clearCookie(name) {
            var d = new Date();
            d.setTime(d.getTime() + (-1 * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString();
            document.cookie = name + "=" + "" + "; " + expires;
        },

        // 退出
        quit() {
            this.clearCookie('userName');
            this.clearCookie('isSuperuser');
            location.href = './login.html';
        },
    },
})