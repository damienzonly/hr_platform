import {app} from './http/app'
import { logger } from './lib/logger';
import {db} from './sql/dbutils'

const port = process.env.HTTP_PORT || 5000;

;(async () => {
    await db.authenticate();
    app.listen(port, () => logger.info(`server listening on port ${port}`));
})();