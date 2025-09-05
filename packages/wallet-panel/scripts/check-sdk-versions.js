#!/usr/bin/env node

/**
 * SDK Version Lock and Diff Check Script
 * 
 * This script enforces conscious SDK upgrades by:
 * 1. Maintaining a lock file with expected SDK versions
 * 2. Comparing current package.json versions against the lock
 * 3. Failing CI if versions have changed without updating the lock
 * 4. Providing clear diff output for version changes
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const LOCK_FILE = path.join(__dirname, '..', 'sdk-versions.lock.json')
const PACKAGE_JSON = path.join(__dirname, '..', 'package.json')

// Critical SDKs that must be version-locked
const CRITICAL_SDKS = [
  '@privy-io/react-auth',
  '@zerodev/sdk',
  'viem',
  'wagmi',
  '@tanstack/react-query',
  '@walletconnect/modal'
]

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null
    }
    throw error
  }
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n')
}

function getCurrentVersions() {
  const packageJson = readJsonFile(PACKAGE_JSON)
  if (!packageJson) {
    throw new Error('package.json not found')
  }

  const versions = {}
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.peerDependencies
  }

  for (const sdk of CRITICAL_SDKS) {
    if (allDeps[sdk]) {
      versions[sdk] = allDeps[sdk]
    }
  }

  return versions
}

function getLockedVersions() {
  return readJsonFile(LOCK_FILE) || {}
}

function createLockFile() {
  const currentVersions = getCurrentVersions()
  const lockData = {
    lastUpdated: new Date().toISOString(),
    versions: currentVersions,
    note: "This file locks critical SDK versions. Update consciously when upgrading dependencies."
  }
  
  writeJsonFile(LOCK_FILE, lockData)
  console.log('✅ Created SDK version lock file')
  console.log('📦 Locked versions:')
  Object.entries(currentVersions).forEach(([pkg, version]) => {
    console.log(`   ${pkg}: ${version}`)
  })
}

function compareVersions(current, locked) {
  const changes = {
    added: {},
    removed: {},
    changed: {}
  }

  // Find added packages
  for (const [pkg, version] of Object.entries(current)) {
    if (!locked[pkg]) {
      changes.added[pkg] = version
    } else if (locked[pkg] !== version) {
      changes.changed[pkg] = { from: locked[pkg], to: version }
    }
  }

  // Find removed packages
  for (const [pkg, version] of Object.entries(locked)) {
    if (!current[pkg]) {
      changes.removed[pkg] = version
    }
  }

  return changes
}

function printChanges(changes) {
  let hasChanges = false

  if (Object.keys(changes.added).length > 0) {
    hasChanges = true
    console.log('\n➕ Added packages:')
    Object.entries(changes.added).forEach(([pkg, version]) => {
      console.log(`   ${pkg}: ${version}`)
    })
  }

  if (Object.keys(changes.removed).length > 0) {
    hasChanges = true
    console.log('\n➖ Removed packages:')
    Object.entries(changes.removed).forEach(([pkg, version]) => {
      console.log(`   ${pkg}: ${version}`)
    })
  }

  if (Object.keys(changes.changed).length > 0) {
    hasChanges = true
    console.log('\n🔄 Changed packages:')
    Object.entries(changes.changed).forEach(([pkg, { from, to }]) => {
      console.log(`   ${pkg}: ${from} → ${to}`)
    })
  }

  return hasChanges
}

function checkVersions() {
  const currentVersions = getCurrentVersions()
  const lockData = getLockedVersions()
  
  if (!lockData.versions) {
    console.log('⚠️  No SDK version lock found. Creating initial lock file...')
    createLockFile()
    return true
  }

  const changes = compareVersions(currentVersions, lockData.versions)
  const hasChanges = printChanges(changes)

  if (hasChanges) {
    console.log('\n❌ SDK versions have changed!')
    console.log('\nTo resolve this:')
    console.log('1. Review the changes above carefully')
    console.log('2. Test that all functionality still works')
    console.log('3. Run the canary tests: npm run test:canary')
    console.log('4. Update the lock file: npm run update-sdk-lock')
    console.log('\nOr revert the dependency changes if they were unintentional.')
    return false
  }

  console.log('✅ All SDK versions match the lock file')
  return true
}

function updateLockFile() {
  const currentVersions = getCurrentVersions()
  const lockData = {
    lastUpdated: new Date().toISOString(),
    versions: currentVersions,
    note: "This file locks critical SDK versions. Update consciously when upgrading dependencies."
  }
  
  writeJsonFile(LOCK_FILE, lockData)
  console.log('✅ Updated SDK version lock file')
  console.log('📦 New locked versions:')
  Object.entries(currentVersions).forEach(([pkg, version]) => {
    console.log(`   ${pkg}: ${version}`)
  })
}

function showStatus() {
  const currentVersions = getCurrentVersions()
  const lockData = getLockedVersions()
  
  console.log('📦 Current SDK Versions:')
  Object.entries(currentVersions).forEach(([pkg, version]) => {
    const locked = lockData.versions?.[pkg]
    const status = locked === version ? '✅' : locked ? '⚠️ ' : '🆕'
    console.log(`   ${status} ${pkg}: ${version}`)
  })
  
  if (lockData.lastUpdated) {
    console.log(`\n🔒 Lock file last updated: ${lockData.lastUpdated}`)
  }
}

function main() {
  const command = process.argv[2]
  
  try {
    switch (command) {
      case 'check':
        const isValid = checkVersions()
        process.exit(isValid ? 0 : 1)
        break
        
      case 'update':
        updateLockFile()
        break
        
      case 'status':
        showStatus()
        break
        
      case 'init':
        createLockFile()
        break
        
      default:
        console.log('Usage: node check-sdk-versions.js <command>')
        console.log('')
        console.log('Commands:')
        console.log('  check   - Check if current versions match lock file (CI mode)')
        console.log('  update  - Update lock file with current versions')
        console.log('  status  - Show current version status')
        console.log('  init    - Create initial lock file')
        process.exit(1)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = {
  getCurrentVersions,
  getLockedVersions,
  compareVersions,
  checkVersions,
  updateLockFile
}
