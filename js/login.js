var app = new Vue({
    el: "#app",
    data() {
        //校验
        const ruleValid = (rule, value, callback) => {
            let _this = this;
            let el = document.getElementById('valid');
            el.dispatchEvent(new Event('input'));
            if (_this.loginForm.realValid.toString().replace(/,/g, '') == value) {
                callback();
            } else {
                callback(new Error('验证码不正确'));
            }
        }

        return {

            // base
            // baseURL: "http://192.168.57.122:65517",
            baseURL: 'http://124.71.207.110:65517',

            // 背景文件
            backName: '',

            // 登录表单
            loginForm: {
                userName: '',
                password: '',
                securityCode: '',
                realValid: '',
            },

            // 登录校验规则
            loginRules: {
                userName: [
                    {required: true, message: '用户名不能为空', trigger: ['blur', 'change']},
                    {pattern: /^[1-9a-zA-Z]{6,11}$/, message: '用户名必须为6-11位数字或英文字母', trigger: ['change', 'blur']},
                ],

                password: [
                    {required: true, message: '密码不能为空', trigger: ['blur', 'change']},
                ],

                securityCode: [
                    {required: true, message: '验证码不能为空', trigger: ['blur', 'change']},
                    {validator: ruleValid, trigger: ['blur', 'change']},
                ],
            },
        }
    },

    mounted() {
        this.getBackName();
    },

    methods: {

        // 重置
        reset: function () {
            let _this = this;
            _this.loginForm.userName = '';
            _this.loginForm.password = '';
            _this.loginForm.securityCode = '';
        },

        // 登录验证方法
        loginCheck: function (formName) {
            let _this = this;
            _this.$refs[formName].validate((valid) => {
                if (valid) {
                    console.log('表单验证成功');
                    _this.sendLoginDataToBack();
                } else {
                    console.log('表单提交验证失败');
                    return false;
                }
            })
        },

        // 校验数据发送给后端
        sendLoginDataToBack: function () {
            let _this = this;
            console.log(_this.loginForm);
            axios.post(_this.baseURL + '/login/check/', JSON.stringify(_this.loginForm))
                .then(response => {
                    console.log(response.data);
                    if (response.data.code === 200) {
                        _this.$message.success(response.data.msg);
                        // 登录成功，设置cookie
                        _this.setCookie('userName', _this.loginForm.userName);
                        _this.setCookie('isSuperuser', response.data.isSuperuser);

                        // 跳转页面
                        setTimeout(() => {
                            location.href = 'index.html';
                        }, 1500);
                    } else {
                        if (response.data.errCount != 0) {
                            if (response.data.errCount === 10) {
                                _this.$message.error(response.data.msg);
                            } else {
                                _this.$message.error("登陆失败，您还可以尝试" + response.data.errCount + "次");
                            }
                        } else {
                            _this.$message.error(response.data.msg);
                        }
                    }
                })
                .catch(error => {
                    console.log(error);
                })
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

        // 设置cookie
        setCookie: function (name, value) {
            var Days = 30;
            var exp = new Date();
            exp.setTime(exp.getTime() + 24 * 60 * 60 * 1000);
            document.cookie = name + "=" + escape(value) + ";expires=" + exp.toString();
        },

        // 获取背景
        getBackName: function () {
            var randi = this.randomNum(1, 6);
            this.backName = './img/back' + randi + '.mp4';
            // this.backName = './img/back6.mp4';
        },

        //生成从minNum到maxNum的随机数
        randomNum: function (minNum, maxNum) {
            switch (arguments.length) {
                case 1:
                    return parseInt(Math.random() * minNum + 1, 10);
                    break;
                case 2:
                    return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
                    break;
                default:
                    return 0;
                    break;
            }
        }

    },
})