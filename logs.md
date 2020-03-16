## 更新日志
### 2020-03-05
```shell
1、多语言导出功能去重
2、修复安卓4.X兼容性问题
3、优化安装脚手架有时候不成功
4、新增脚手架初始化指令：dyang -m（初始化脚手架安装项目依赖）
```
### 2020-03-16
```shell
1、新增配置requiredImport,自定义UI组件按需引入配置
    {
        "requiredImport": {
            "vue-dyangui": "lib"
        },...
    }
2、删除旧的配置问题API地址，区别：
    a、旧的
        {
            "prod": {
                "BASE_API":"'http://prod.com'"
            },
            "dev": {
                 "BASE_API":"'http://qa.com'"
            }
        }
    b、新的
        {
            "BASE_API_DEV": "'http://qa.com'",
            "BASE_API_PROD": "'http://prod.com'"
        }
3、删除配置devServerHost字段，优化成自动获取本地局域网IP地址
4、修复多媒体文件生产环境编译后路径问题
5、删除白名单指令，支持可以安装任意第三方运行环境资源包,(注意：不支持开发包安装，安装也无法使用)
6、修复已知问题
7、（注意：如果项目中依赖全局UI库请重新执行安装命令下载dyang -i [pagckge name@version]）
```