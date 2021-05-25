var app = new Vue({
    el: "#infoApp",
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
            // 数据表格
            tableData: [],
            currentPageData: [],
            currentpage: 1,
            pagesize: 11,
            total: 0,

            // 下载数据
            downloadData: [],
        }
    },
    mounted() {
        this.checkIsSuperuser();
        this.getApplicationInfoFromBack();
        if (this.isSuperuser == true) {
            // 普通用户检查是否有新的审查
            this.timer = setInterval(this.checkNewApplication, 2 * 1000 + 200);
        } else {
            // 超级管理员检查是否有新的申请
            this.timer = setInterval(this.checkNewApplicationSuperuser, 2 * 1000 +200);
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

        // 从cookie中获取是否位超级管理员,并获取用户名
        checkIsSuperuser: function () {
            var isSuperuserNum = this.getCookie('isSuperuser');
            if (isSuperuserNum === 1 || isSuperuserNum === '1') {
                this.isSuperuser = false;
            } else {
                this.isSuperuser = true;
            }

            // 获取用户名
            this.userName = this.getCookie('userName');

            // 如果cookie中没有值，则重返登录页面
            if (isSuperuserNum == '' || this.userName == '') {
                location.href = 'login.html';
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

        // 查询申请记录
        getApplicationInfoFromBack: function () {
            let _this = this;
            var isSuperuserNum = this.isSuperuser;
            if (isSuperuserNum === false) {
                isSuperuserNum = '1';
            } else {
                isSuperuserNum = '0';
            }
            axios.post(_this.baseURL + '/application/query/', JSON.stringify({
                'userName': _this.userName,
                'isSuperuser': isSuperuserNum
            }))
                .then(response => {
                    console.log(response.data);
                    _this.total = response.data.data.length;
                    _this.tableData = response.data.data;
                    _this.getCurrentPage();
                    _this.$message.success('读取数据成功');
                })
                .catch(err => {
                    -this.$message.error(err);
                })
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

            // 清洗数据格式
            for (let i = 0; i < _this.currentPageData.length; i++) {

                // 质量级别
                if (_this.currentPageData[i].qualityLevel === 0 || _this.currentPageData[i].qualityLevel == '空号') {
                    _this.currentPageData[i].qualityLevel = '空号';
                } else if (_this.currentPageData[i].qualityLevel === -1 || _this.currentPageData[i].qualityLevel == '未知') {
                    _this.currentPageData[i].qualityLevel = '未知';
                } else if (_this.currentPageData[i].qualityLevel === 1 || _this.currentPageData[i].qualityLevel == '低') {
                    _this.currentPageData[i].qualityLevel = '低';
                } else if (_this.currentPageData[i].qualityLevel === 2 || _this.currentPageData[i].qualityLevel == '中') {
                    _this.currentPageData[i].qualityLevel = '中';
                } else {
                    _this.currentPageData[i].qualityLevel = '高';
                }

                // 申请结果
                if(_this.currentPageData[i].applicationStatus === -1 || _this.currentPageData[i].applicationStatus == '等待审批') {
                    _this.currentPageData[i].applicationStatus = '等待审批';
                } else if(_this.currentPageData[i].applicationStatus === 0 || _this.currentPageData[i].applicationStatus == '审批失败') {
                    _this.currentPageData[i].applicationStatus = '审批失败';
                } else if(_this.currentPageData[i].applicationStatus === 1 || _this.currentPageData[i].applicationStatus == '审批成功') {
                    _this.currentPageData[i].applicationStatus = '审批成功';
                }

                // 是否曾经使用
                if(_this.currentPageData[i].orderCount === 0 || _this.currentPageData[i].orderCount == '否') {
                    _this.currentPageData[i].orderCount = '否';
                } else if(_this.currentPageData[i].orderCount === -1 || _this.currentPageData[i].orderCount == '未选') {
                    _this.currentPageData[i].orderCount = '未选';
                } else {
                    _this.currentPageData[i].orderCount = '是';
                }

                // 审批时间
                if(_this.currentPageData[i].applicationStatus == '等待审批') {
                    _this.currentPageData[i].agreeTime = '暂未审批';
                }
            }
        },

        // 分页行数
        handleSizeChange: function (size) {
            this.pagesize = size;
        },

        // 分页页码
        handleCurrentChange: function (currentPage) {
            this.currentpage = currentPage;
            this.getCurrentPage();
        },

        // 审批
        applicationCheckToBack: function(id, department, qualityLevel, attribute, orderCount, action, userName, lastUsedTime, limit) {
            let _this = this;

            // 质量级别改为数字
            var qualityLevelNum = -1;
            if(qualityLevel == '未知') {
                qualityLevelNum = '';
            }else if(qualityLevel == '空号') {
                qualityLevelNum = 0;
            }else if(qualityLevel == '低') {
                qualityLevelNum = 1;
            }else if(qualityLevel = '高'){
                qualityLevelNum = 2;
            }

            // 曾经使用改为数字
            var orderCountNum = 0;
            if(orderCount == '未选') {
                orderCountNum = '';
            } else if(orderCount == '是') {
                orderCountNum = 1;
            }
            var data = {
                'id': id,
                'phone': '',
                'department': department,
                'qualityLevel': qualityLevelNum,
                'attribute': attribute,
                'orderCount': orderCountNum,
                'action': action,
                'applyName': userName,
                'lastUsedTime': lastUsedTime,
                'limit': limit,
                'userName': _this.userName,
            }
            console.log(data);
            axios.post(_this.baseURL + '/application/progress/', JSON.stringify(data))
                .then(response => {
                    if(response.data.code == 200) {
                        _this.$message.success('审批成功，可以下载数据了');
                    } else {
                        _this.$message.error(response.data.msg);
                    }
                    this.getApplicationInfoFromBack();
                })
                .catch(error => {
                    _this.$message.error(error);
                })
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
                                message: '您收到了新的申请结果。您可以手动刷新页面查看审批结果。<a href="./applicationInfo.html">刷新</a>',
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
                    if(response.data.code === 200) {
                        if(response.data.count > 0) {
                            _this.$notify.info({
                                title: '提示',
                                message: '您收到了新的审批申请,可以刷新页面查看。<a href="./applicationInfo.html">刷新</a>',
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

        // 下载
        downloadToCSV(operationName, id) {
            let _this = this;
            // 标题列
            var str = '手机号码\n';

            // 遍历数据
            for(let i = 0; i < _this.downloadData.length; i ++) {
                str += _this.downloadData[i] + '\n';
            }

            var blob = new Blob([str], {type: "text/plain;charset=utf-8"});
            //解决中文乱码问题
            blob = new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
            object_url = window.URL.createObjectURL(blob);
            var link = document.createElement("a");
            link.href = object_url;
            link.download = operationName + "-" + id + ".csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        },

        downloadFromBack(operationName, id) {
            let _this = this;
            axios.post(_this.baseURL + '/application/download/', JSON.stringify({'userName': _this.userName, 'id': id}))
                .then(response => {
                    if(response.data.code === 200) {
                        _this.downloadData = response.data.data;
                        _this.downloadToCSV(operationName, id);
                        console.log(_this.downloadData);
                        _this.$message.success('下载成功，请在浏览器下载页面中查看。');
                    } else {
                        _this.$message.error(response.data.msg);
                    }
                })
                .catch(error => {
                    _this.$message.error(error);
                })
        },

        //清除cookie
        clearCookie(name) {
            var d = new Date();
            d.setTime(d.getTime() + (-1*24*60*60*1000));
            var expires = "expires="+d.toUTCString();
            document.cookie = name + "=" + "" + "; " + expires;
        },

        // 退出
        quit() {
            this.clearCookie('userName');
            this.clearCookie('isSuperuser');
            location.href = './login.html';
        },
    },
});