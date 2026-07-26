# REPORT-VK-DIVERGENCE-TASK-DETAIL-SHELL

status: NEED-YURI

## Что найдено

В backlog есть задача `VK-DIVERGENCE-TASK-DETAIL-SHELL`: в основной версии есть marker `detail-redesign-shell`, а в `vk.html` его нет.

Это не безопасная ночная правка. В задаче прямо сказано: не переносить автоматически, а сначала решить, должен ли VK получить тот же task-detail shell.

## Что нужно решить Юрию

Нужно выбрать один вариант:

1. Переносим task-detail redesign shell в VK.
2. Оставляем VK с отдельной карточкой задачи и записываем причину.
3. Делаем отдельную согласованную задачу на общий shell для обеих поверхностей.

## Почему код не менялся

Task-detail shell влияет на карточку задачи, редактирование и сценарии проверки. Без решения можно случайно смешать VK-поведение с Telegram/web-дизайном.

## Где проверить после решения

После выбранного варианта можно запускать focused VK task-detail smoke и marker check для `detail-redesign-shell`.
