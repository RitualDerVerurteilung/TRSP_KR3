# Работа с базой данных

Вся работа с базой данных реализована с помощью библиотек pg, db-migration.
<br>Возможности создания (команда npx db-migrate up) и удаления (команда npx db-migrate down) таблицы находится в папке migrations/sqls.
<br>Создание pool, который бы выполнял запросы к БД, происходит в файле /src/api/db/database.js.
<br>Работа с бд происходит в API.js в пути /api/auth/register
