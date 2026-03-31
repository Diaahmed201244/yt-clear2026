import fs from "fs"
import path from "path"
import { VaultConfig } from "./VaultConfig.js"

export function appendToVault(serializedEvent) {
  if (!VaultConfig.enabled) return
  if (!fs.existsSync(VaultConfig.path)) {
    fs.mkdirSync(VaultConfig.path, { recursive: true })
  }
  const fileName = `${VaultConfig.filePrefix}-${new Date().toISOString().slice(0, 10)}.log`
  const filePath = path.join(VaultConfig.path, fileName)
  fs.appendFileSync(filePath, serializedEvent + "\n")
}
