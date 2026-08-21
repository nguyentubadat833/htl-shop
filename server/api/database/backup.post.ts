import { runSqlBackup } from "~~/server/core/execute/backupsql";

export default defineWrappedRequiredAdminHandler(async (event) => {
  await runSqlBackup();

  setResponseStatus(event, 204);
});
