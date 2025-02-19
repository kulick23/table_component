# Table Component

Данный проект — это таблица с данными об аниме, которые получаются из публичного API Jikan (https://jikan.moe/).

## Возможности
- **Поиск по названию:** Фильтрация строк таблицы в зависимости от введённого текста.
- **Фильтрация по диапазону оценок:** Указание минимального и максимального значения рейтинга.
- **Фильтрация по типу аниме:** Выбор типа аниме (TV, Movie, OVA, Special и др.).
- **Сортировка:** Возможность сортировки по названию, рейтингу или дате выпуска (по возрастанию/убыванию).
- **Пагинация:** Подгрузка страниц с данными из API с отображением текущей страницы и общего количества страниц.
- **Сохранение состояния:** Все фильтры, текущая страница и сортировка сохраняются в `localStorage` и в URL (query-параметры).
- **Сброс настроек:** Кнопка сброса фильтров возвращает таблицу в исходное состояние.

---

## Инструкция по установке и запуску проекта локально


### 1. Клонирование репозитория
Склонируйте проект из вашего репозитория GitHub:

git clone <URL вашего репозитория>
cd <название папки проекта>


### 2. Установка зависимостей
Склонируйте проект из вашего репозитория GitHub:

npm install


### 3. Запуск проекта
Склонируйте проект из вашего репозитория GitHub:

npm start


### 3. Сборка для продакшена

npm run build




