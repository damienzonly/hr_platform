import {app} from './http/app'
import {db} from './sql/dbutils'

;(async () => {
    await db.authenticate();
    app.listen(process.env.HTTP_PORT || 5000);
})();