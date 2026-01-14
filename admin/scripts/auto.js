#!/usr/bin/env node

/**
 * 主自動化指令腳本
 * 整合測試、檢查、修復、建置驗證
 * 
 * 使用方法:
 *   npm run auto
 *   或
 *   node scripts/auto.js
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
}

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.blue}═══════════════════════════════════════${colors.reset}\n${colors.bright}${colors.magenta}▶${colors.reset} ${msg}\n${colors.bright}${colors.blue}═══════════════════════════════════════${colors.reset}\n`),
  step: (msg) => console.log(`\n${colors.cyan}→${colors.reset} ${msg}`),
}

const projectRoot = path.resolve(__dirname, '..')
const scriptsDir = path.join(projectRoot, 'scripts')

function runScript(scriptName, description) {
  log.step(description)
  try {
    const scriptPath = path.join(scriptsDir, scriptName)
    if (!fs.existsSync(scriptPath)) {
      log.error(`${scriptName} 不存在`)
      return false
    }

    const output = execSync(`node ${scriptPath}`, {
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: 'inherit',
    })
    return true
  } catch (error) {
    log.error(`執行 ${scriptName} 失敗`)
    return false
  }
}

function runCommand(command, description) {
  log.step(description)
  try {
    execSync(command, {
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: 'inherit',
    })
    return true
  } catch (error) {
    log.error(`執行命令失敗: ${command}`)
    return false
  }
}

// 主流程
async function main() {
  console.log(`\n${colors.bright}${colors.magenta}`)
  console.log('╔═══════════════════════════════════════════════════════════╗')
  console.log('║                                                           ║')
  console.log('║           自動化測試、檢查、修復系統                      ║')
  console.log('║                                                           ║')
  console.log('╚═══════════════════════════════════════════════════════════╝')
  console.log(colors.reset)

  const results = {
    fix: false,
    test: false,
    check: false,
    build: false,
  }

  // 步驟 1: 自動修復
  log.section('步驟 1: 自動修復')
  results.fix = runScript('auto-fix.js', '執行自動修復')

  // 步驟 2: 自動測試
  log.section('步驟 2: 自動測試')
  results.test = runScript('auto-test.js', '執行自動測試')

  // 步驟 3: 代碼檢查
  log.section('步驟 3: 代碼質量檢查')
  results.check = runScript('auto-check.js', '執行代碼檢查')

  // 步驟 4: 建置驗證
  log.section('步驟 4: 建置驗證')
  results.build = runCommand('npm run build', '執行建置測試')

  // 總結
  log.section('執行總結')
  console.log(`${colors.cyan}自動修復:${colors.reset} ${results.fix ? colors.green + '✓ 通過' : colors.red + '✗ 失敗' + colors.reset}`)
  console.log(`${colors.cyan}自動測試:${colors.reset} ${results.test ? colors.green + '✓ 通過' : colors.red + '✗ 失敗' + colors.reset}`)
  console.log(`${colors.cyan}代碼檢查:${colors.reset} ${results.check ? colors.green + '✓ 通過' : colors.yellow + '⚠ 有警告' + colors.reset}`)
  console.log(`${colors.cyan}建置驗證:${colors.reset} ${results.build ? colors.green + '✓ 通過' : colors.red + '✗ 失敗' + colors.reset}`)

  const allPassed = results.fix && results.test && results.build

  if (allPassed) {
    console.log(`\n${colors.bright}${colors.green}`)
    console.log('╔═══════════════════════════════════════════════════════════╗')
    console.log('║                                                           ║')
    console.log('║            ✓ 所有檢查通過，系統正常！                      ║')
    console.log('║                                                           ║')
    console.log('╚═══════════════════════════════════════════════════════════╝')
    console.log(colors.reset)
    process.exit(0)
  } else {
    console.log(`\n${colors.bright}${colors.red}`)
    console.log('╔═══════════════════════════════════════════════════════════╗')
    console.log('║                                                           ║')
    console.log('║            ✗ 部分檢查未通過，請查看上方錯誤訊息           ║')
    console.log('║                                                           ║')
    console.log('╚═══════════════════════════════════════════════════════════╝')
    console.log(colors.reset)
    process.exit(1)
  }
}

// 執行主流程
main().catch(error => {
  log.error(`執行過程出錯: ${error.message}`)
  console.error(error)
  process.exit(1)
})
