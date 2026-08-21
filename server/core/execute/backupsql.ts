import path from "path";
import fs from "fs";
import os from "os";
import { exec } from "child_process";
import { promisify } from "util";
import { S3 } from "../service/s3";

export async function runSqlBackup() {
  const runtimeConfig = useRuntimeConfig();
  const dbConfig = runtimeConfig.db;

  const dbHost = dbConfig.host;
  const dbPort = Number(dbConfig.port);
  const dbName = dbConfig.name;
  const dbUser = dbConfig.user;
  const dbPass = dbConfig.pass;

  const execAsync = promisify(exec);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `backup-${dbName}-${timestamp}.sql`;
  const tmpDir = os.tmpdir();
  const backupFilePath = path.join(tmpDir, filename);

  const cmd = `PGPASSWORD="${dbPass}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} ${dbName} > ${backupFilePath}`;

  try {
    console.log(`[Backup] Running: ${cmd}`);

    await execAsync(cmd);
    console.log(`[Backup] Database dumped: ${backupFilePath}`);

    await S3.CLIENT.fPutObject(S3.BUCKET_UPLOAD_DEFAULT, `backups/database/${filename}`, backupFilePath).then(() => {
      console.log(`[Backup] Database saved to storage: ${filename}`);
    });
  } catch (err) {
    console.error("[Backup] Failed:", err);
  } finally {
    if (fs.existsSync(backupFilePath)) fs.unlinkSync(backupFilePath);
  }
}
