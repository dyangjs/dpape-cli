#!/usr/bin/env node
import * as fs from 'fs';
import * as program from 'commander';
import * as inquirer from 'inquirer';
import { createProjectJsonFile } from './core/create';
import { BuildFileDist, FixProjetFiles } from './core/build';
import server from './core/server';
import { Install, ExportTranslate, LangList } from './core/tools';
import { spawn,spawnSync } from 'child_process';
import * as path from 'path';

/** 构建项目 */
const createProject = () => {
    /** 当前命令所在的目录 */
    const currentPath = process.cwd();
    const configFilePath = `${currentPath}/dyang.config.json`;
    if(fs.existsSync(configFilePath)){
        const message = `Config File Has Exist, Path [${configFilePath}]`;
        throw Error(message);
    }
    inquirer.prompt([
        { 
            type: 'input', 
            name: 'appName', 
            message: 'Project Name',
            default: "dyang"
        },
        {
            type:"list",
            name:"projectType",
            message:"Please Choose Project Type",
            choices:[
                "SPA",
                "MPA"
            ],
            default:0
        },
        { 
            type: 'input', 
            name: 'mainPath', 
            message: 'Project Main File Name',
            default: "src"
        },
        {
            type:"confirm",
            name:"promptMaintain",
            message:"Whether Need Create [maintain] Page?",
            default:true
        },
        {
            type:"confirm",
            name:"prompt404",
            message:"Whether Need Create [404] Page?",
            default:true
        },
        {
            type:"confirm",
            name:"promptError",
            message:"Whether Need Create [server-error] Page?",
            default:true
        }
    ]).then(answers=>{
        createProjectJsonFile(currentPath,answers);
    })
}

/** 输出当前版本信息 */
const viewVersion = () => {
    console.log('Version 0.1.13')
}

/** 开发模式启动web服务 */
const runDevSever = () => {
    server();
}

const viewLangList = ()=>{
    let langs = '';
    for (const key in LangList) {
        const v = LangList[key];
        if(typeof v === 'number') continue;
        langs += `- ${v}\r\n`;
    }
    console.log(`Support Langs:\r\n${langs}`);
}

/** 公共组件库更新到最新 */
const UpgradeUiComponent = () =>{
    const isWin = process.platform == 'win32';
    const prefix = isWin ? 'npm.cmd' : 'npm';
    /** 安装包资源 */
    console.log('Start Upgrade ...');
    let params = ['i'];
    params = [...params];
    params = [...params,...['-S']];
    const cmd = spawn(prefix,params,{
        cwd:path.resolve(__dirname,`../`),
        stdio: 'inherit'
    });
    /** 安装完成退出 */
    cmd.on('exit',()=>{
        console.log('Upgrade Done');
    });
    /** 安装失败退出 */
    cmd.on('error',()=>{
        console.log('Upgrade Fila');
    })
    /** 用户强制退出 */
    process.on('SIGINT', ()=>{
        console.log('Upgrade Fail. [Manual Exit]');
        process.kill(process.pid)
    });
}

/**
 * 初始化脚手架
 */
const initCli = ()=>{
    const webpackPath = path.resolve(__dirname,'../webpack');
    const isWin = process.platform == 'win32';
    const prefix = isWin ? 'npm.cmd' : 'npm';  
    try{
        spawnSync(prefix,['i'],{        
            stdio: 'inherit',
            cwd:webpackPath
        });
        console.log('Initialization the CLI successful');
    }catch(e){
        console.log(e);
    }
}

program
  .option('-c, --create', 'Create a new project', createProject)
  .option('-v, --version', 'Show current version', viewVersion)
  .option('-s, --start', 'Run dev server', runDevSever)
  .option('-b, --build', 'Build the project', BuildFileDist)
  .option('-i, --install','Install package resources:-i vue@2.0.0.0 or -i vue',Install)
  .option('-t, --translate', 'Export Project <% example %>', ExportTranslate)
  .option('-l, --lang', 'Show Translate Support Langs', viewLangList)
  .option('-r, --repair', 'Repair Project Files', FixProjetFiles)
  .option('-u, --upgrade', 'Upgrade the common UI component library', UpgradeUiComponent)
  .option('-m, --mending', 'Initialization the CLI', initCli)
  .parse(process.argv);