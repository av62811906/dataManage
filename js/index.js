var app = new Vue({
    el: '#indexApp',
    data() {
        return {

            // base
            // baseURL: "http://192.168.57.122:65517",
            baseURL: 'http://124.71.207.110:65517',
            // 搜索框
            inputStr: '',

            // 是否超级管理员
            isSuperuser: '',
            // 用户名
            userName: '',

            // 数据表格
            tableData: [],
            currentPageData: [],
            currentpage: 1,
            pagesize: 10,
            total: 0,

            // 定时器，查询是否有新的审批
            timer: '',

            // 备注
            commons: '',

            // dialog是否可见
            dialogVisible: false,
            dialogVisible2: false,
            labelPosition: 'right',

            // 文件上传路径
            // uploadFileUrl: 'http://192.168.57.122:65517/file/upload/',
            uploadFileUrl: 'http://124.71.207.110:65517/file/upload/',
            // 文件参数
            uploadParams: {
                'phoneCol': '',
                'department': '',
                'attributeCol1': '',
                'attributeCol2': '',
                'attributeCol3': '',
                'attributeCol4': '',
                'createTime': '',
            },

            // 文件名
            fileName: '',

            // 回执文件上传路径
            // responseFileUrl: 'http://192.168.57.122:65517/response/upload/',
            responseFileUrl: 'http://124.71.207.110:65517/response/upload/',
            // 文件参数
            responseParams: {
                'phoneCol': '被叫号码',
                'resultCol': '分析结果',
            },
            // 文件名
            responseName: '',

            uploadParamsRules: {
                phoneCol: [
                    {required: true, message: '必须填入手机号所属的列', trigger: ['change', 'blur']},
                    // {pattern: /^\d{1,2}$/, message: '只能填入1-2位数字', trigger: ['change', 'blur']},
                ],
                attribute: [
                    {required: true, message: '必须填入至少一列属性所属列', trigger: ['change', 'blur']},
                ],
                createTime: [
                    {required: true, message: '必须选择业务发生日期', trigger: ['change', 'blur']},
                ],
            },

            // 查询表单  // data/query/
            queryForm: {
                'phone': '',
                'department': '',
                'qualityLevel': '',
                'attribute': '',   // 模糊查
                'orderCount': '',  // 0或1
                'active': '', // 0 || 1
                'lastUsedTime': '',
                'limit': '',
                'usedHistory': '',
            },
            departmentOptions: [
                {value: '', label: '不选择'},
                {value: '短信', label: '短信部门'},
                {value: '语音', label: '语音部门'},
            ],
            qualityLevelOptions: [
                {value: '', label: '不选择'},
                {value: 0, label: '空号'},
                {value: 1, label: '低'},
                {value: 2, label: '中'},
                {value: 3, label: '高'},
            ],
            activeOptions: [
                {value: '', label: '不选择'},
                {value: 0, label: '不可用'},
                {value: 1, label: '可用'},
            ],
            orderCountOptions: [
                {value: '', label: '不选择'},
                {value: 0, label: '未曾使用'},
                {value: 1, label: '曾经使用过'},
            ],

            // 时间日期选择器参数
            pickerOptions: {
                shortcuts: [{
                    text: '今天',
                    onClick(picker) {
                        picker.$emit('pick', new Date());
                    }
                }, {
                    text: '昨天',
                    onClick(picker) {
                        const date = new Date();
                        date.setTime(date.getTime() - 3600 * 1000 * 24);
                        picker.$emit('pick', date);
                    }
                }, {
                    text: '一周前',
                    onClick(picker) {
                        const date = new Date();
                        date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
                        picker.$emit('pick', date);
                    }
                }]
            },
        }
    },
    mounted() {
        this.checkIsSuperuser();
        this.getDataFromBack();
        if (this.isSuperuser == true) {
            // 普通用户检查是否有新的审查
            this.timer = setInterval(this.checkNewApplication, 2 * 1000 + 200);
        } else {
            // 超级管理员检查是否有新的申请
            this.timer = setInterval(this.checkNewApplicationSuperuser, 2 * 1000 + 200);
        }

    },
    methods: {

        // 获取所有数据
        getDataFromBack: function () {
            let _this = this;
            axios.post(_this.baseURL + '/data/all/', JSON.stringify({'userName': _this.userName}))
                .then(response => {
                    if (response.data.code === 200) {
                        console.log(response.data.data);
                        _this.total = response.data.data.length;
                        _this.tableData = response.data.data;
                        _this.getCurrentPage();
                        _this.$message.success('读取数据成功');
                        this.$notify.success({
                            title: 'Info',
                            message: '当前数据总量为  ' + response.data.total + '  条。',
                            showClose: false
                        });
                    } else {
                        _this.$message.error(response.data.msg);
                    }
                })
                .catch(error => {
                    _this.$message.error(error);
                })
        },

        // 获取查询数据
        getQueryDataFromBack: function () {
            let _this = this;
            var data = _this.queryForm;
            data['userName'] = _this.userName;
            var lastUsedTime = _this.queryForm.lastUsedTime;
            var formatterLastUsedTime = [];
            for (let i = 0; i < lastUsedTime.length; i++) {
                var year = lastUsedTime[i].getFullYear();
                var month = lastUsedTime[i].getMonth() + 1;
                var date = lastUsedTime[i].getDate();
                if (month < 10) {
                    month = '0' + month.toString();
                }
                if (date < 10) {
                    date = '0' + date.toString();
                }
                formatterLastUsedTime.push(year + '-' + month + '-' + date);
            }
            data['lastUsedTime'] = formatterLastUsedTime;
            console.log(data);
            axios.post(_this.baseURL + '/data/query/', JSON.stringify(data))
                .then(response => {
                    console.log(response.data);
                    if (response.data.code === 200) {
                        _this.currentpage = 1;
                        _this.total = response.data.data.length;
                        _this.tableData = response.data.data;
                        _this.getCurrentPage();
                        this.$notify.success({
                            title: 'Info',
                            message: '当前数据总量为  ' + response.data.total + '  条。',
                            showClose: false
                        });
                        // _this.$message.success('读取数据成功');
                    } else {
                        _this.$message.error('读取数据失败');
                    }
                })
                .catch(error => {
                    _this.$message.error(error);
                })
        },

        // 输入下载备注
        downloadApplyReserveToBack: function () {
            let _this = this;
            _this.$prompt('请输入申请说明', '提示', {
                confirmButtonText: '提交申请',
                cancelButtonText: '取消',
                inputPattern: /^.{3,100}$/,
                inputErrorMessage: '请输入3字以上的备注说明。',
            }).then(({value}) => {
                _this.commons = value;
                _this.downloadApplyToBack();
                // _this.$message.success(_this.commons);
            })
                .catch(error => {
                    _this.$message.info('取消申请');
                })
        },

        // 下载申请
        downloadApplyToBack: function () {
            let _this = this;
            var phone = _this.queryForm.phone;
            var department = _this.queryForm.department;
            var qualityLevel = _this.queryForm.qualityLevel;
            var attribute = _this.queryForm.attribute;
            var orderCount = _this.queryForm.orderCount;
            if (orderCount == '') {
                orderCount = -1;
            }
            var active = _this.queryForm.active;
            var lastUsedTime = _this.queryForm.lastUsedTime;
            var limit = _this.queryForm.limit;
            var userName = _this.getCookie('userName');
            var commons = _this.commons;
            var usedHostory = _this.queryForm.usedHistory;
            var res = {
                'phone': phone,
                'department': department,
                'qualityLevel': qualityLevel,
                'attribute': attribute,
                'orderCount': orderCount,
                'active': active,
                'lastUsedTime': lastUsedTime,
                'limit': limit,
                'userName': userName,
                'commons': commons,
                'usedHostory': usedHostory,
            }

            axios.post(_this.baseURL + '/data/apply/', JSON.stringify(res))
                .then(response => {
                    if (response.data.code === 200) {
                        _this.$message.success('提交成功，请在申请记录中查看审批结果');
                    } else {
                        _this.$message.error(response.data.msg);
                    }
                })
                .catch(error => {
                    _this.$message.error(error);
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

                if (_this.currentPageData[i].active === 0 || _this.currentPageData[i].active == '否') {
                    _this.currentPageData[i].active = '否';
                } else if (_this.currentPageData[i].active === 1 || _this.currentPageData[i].active == '是') {
                    _this.currentPageData[i].active = '是';
                }
            }
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

        // 上传文件弹窗dialog
        switchDialogVisible() {
            this.uploadParams = {
                'phoneCol': '',
                'department': '',
                'attributeCol1': '',
                'attributeCol2': '',
                'attributeCol3': '',
                'attributeCol4': '',
                'createTime': '',
            };
            this.dialogVisible = true;
        },

        // 上传回执文件弹窗dialog
        switchDialogVisible2() {
            this.responseParams = {
                'phoneCol': '被叫号码',
                'resultCol': '分析结果',
            };
            this.dialogVisible2 = true;
        },

        // 关闭窗口重置参数
        resetParams() {

            this.dialogVisible = false;
            this.dialogVisible2 = false;

            this.uploadParams = {
                'phoneCol': '',
                'department': '',
                'attributeCol1': '',
                'attributeCol2': '',
                'attributeCol3': '',
                'attributeCol4': '',
                'createTime': '',
            }
            this.responseParams = {
                'phoneCol': '被叫号码',
                'resultCol': '分析结果',
            }

            // this.$message.info('取消上传');
        },

        // 预览文件
        fileUploadOnSuccess(response, file, fileList) {
            console.log(file);
            console.log(fileList);
        },

        // 表单验证方法
        uploadCheck(formName) {
            let _this = this;
            _this.$refs[formName].validate((valid) => {
                if (valid) {
                    console.log('表单验证成功');
                    _this.fileUploadParams();
                } else {
                    console.log('表单提交验证失败');
                    return false;
                }
            })
        },

        // 上传文件参数
        fileUploadParams() {
            let _this = this;
            var phoneCol = _this.uploadParams.phoneCol;
            var department = _this.uploadParams.department;
            var attributeCol1 = _this.uploadParams.attributeCol1;
            var attributeCol2 = _this.uploadParams.attributeCol2;
            var attributeCol3 = _this.uploadParams.attributeCol3;
            var attributeCol4 = _this.uploadParams.attributeCol4;
            var attribute = attributeCol1 + ',' + attributeCol2 + ',' + attributeCol3 + ',' + attributeCol4;
            attribute = attribute.replace(/(^,*)|(,*$)/g, "");
            var createTime = _this.uploadParams.createTime;
            var year = createTime.getFullYear();
            var month = createTime.getMonth() + 1;
            var date = createTime.getDate();
            var hours = createTime.getHours();
            var minutes = createTime.getMinutes();
            var seconds = createTime.getSeconds();
            if (month < 10) {
                month = '0' + month.toString();
            }
            if (date < 10) {
                date = '0' + date.toString();
            }
            if (hours < 10) {
                hours = '0' + hours.toString();
            }
            if (minutes < 10) {
                minutes = '0' + minutes.toString();
            }
            if (seconds < 10) {
                seconds = '0' + seconds.toString();
            }
            createTime = year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds;
            var userName = _this.userName;
            var data = {
                'phoneCol': phoneCol,
                'department': department,
                'attributeCol': attribute,
                'createTime': createTime,
                'userName': userName,
            }
            console.log(data);
            axios.post(_this.baseURL + '/file/parameter/', JSON.stringify(data))
                .then(response => {
                    if (response.data.code === 200) {
                        _this.$message.success(response.data.msg);
                        _this.$notify.info({
                            title: '提示',
                            message: '您上传了新的数据，页面将在5秒后自动刷新，您也可以手动<a href="./index.html">刷新</a>。',
                            showClose: true,
                            duration: 0,
                            dangerouslyUseHTMLString: true,
                        });
                        setTimeout(() => {
                            location.href = 'index.html';
                        }, 5 * 1000);
                        _this.dialogVisible = false;
                    } else {
                        _this.$message.error(response.data.msg);
                    }
                })
                .catch(error => {
                    _this.$message.error(error);
                })
        },

        // 回执参数上传
        responseUploadParams() {
            let _this = this;

            var phoneCol = _this.responseParams.phoneCol;
            var resultCol = _this.responseParams.resultCol;
            var userName = _this.userName;

            axios.post(_this.baseURL + '/response/parameter/', JSON.stringify({
                'phoneCol': phoneCol,
                'resultCol': resultCol,
                'userName': userName
            }))
                .then(response => {
                    if (response.data.code === 200) {
                        _this.$message.success(response.data.msg);
                        // _this.$notify.info({
                        //     title: '提示',
                        //     message: '您上传了新的数据，页面将在5秒后自动刷新，您也可以手动<a href="./index.html">刷新</a>。',
                        //     showClose: true,
                        //     duration: 0,
                        //     dangerouslyUseHTMLString: true,
                        // });
                        // setTimeout(() => {
                        //     location.href = 'index.html';
                        // }, 5 * 1000);
                        _this.dialogVisible2 = false;
                    } else {
                        _this.$message.error(response.data.msg);
                    }
                })
                .catch(error => {
                    _this.$message.error(error);
                })
        },

    },
})