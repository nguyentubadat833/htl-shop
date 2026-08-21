import { runSqlBackup } from "~~/server/core/execute/backupsql";

export default defineWrappedRequiredAdminHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event);
  const dbConfig = runtimeConfig.db;

  await runSqlBackup({
    dbHost: dbConfig.host,
    dbPort: Number(dbConfig.port),
    dbName: dbConfig.name,
    dbUser: dbConfig.user,
    dbPass: dbConfig.pass,
  });

  setResponseStatus(event, 204);
});
