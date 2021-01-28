# Тестовое задание Junior Backend Developer.

### Используемыетехнологии:

* Go или NodeJS
* JWT
* MongoDB

### Задание:

Написать часть сервиса аутентификации.
Два REST маршрута:

* Первый маршрут выдает пару Access, Refresh токенов для пользователя сидентификатором (GUID) указанным в параметре запроса.
* Второй маршрут выполняет Refresh операцию на пару Access, Refreshтокенов.

### Требования:

* Access токен тип JWT, алгоритм SHA512, хранить в базе строго запрещено.
* Refresh токен тип произвольный, формат передачи base64, хранится в базе исключительно в виде bcrypt хеша, должен быть защищен от изменения настороне клиента и попыток повторного использования.
* Access, Refresh токены обоюдно связаны, Refresh операцию для Access токена можно выполнить только тем Refresh токеном который был выдан вместе с ним.

## Основные API методы.

Методы обрабатывают HTTP POST запросы, содержащие все необходимые параметры в JSON.

### Получение токена.

Запрос:

```bash
curl -X POST http://localhost:3000/api/gettoken -d {"""uuid""":"""userId"""}
```

Ответ: пара - токен, refresh токен.

### Обновление токена.

Запрос:

```bash
curl -X POST http://localhost:3000/api/refresh -d {"""access_token""":"""accessToken""", """refresh_token""":"""refreshToken"""}
```

Ответ: новая пара - токен, refresh токен.
