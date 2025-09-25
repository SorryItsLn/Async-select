# Overview

#### Селект имеет два варианта его использования:

- **Синхронная работа** - данные **сразу известны, либо будут известны**, но не будут меняться
- **Асинхронная работа** - данные **будут меняться**, в зависимости от параметров

#### Селект имеет два состояния:

- **Одиночный выбор**
- **Множественный выбор**

# Синхронная работа

<details>
<summary>

Чтобы использовать компонент нужно импортировать **_`MUISelect`_** из **_`@ma/ui`_**

</summary>

- Поле **_`items`_**- обязательно для селектов, в него мы передаем элементы которые хотим видеть в списке

```
    items = [0, 1, 2, 3];
    <mui-select [items]="items"></mui-select>
```

- Так же в **_`items`_** можно передать observable

```html
items = of([0, 1, 2, 3]);
<mui-select [items]="items"></mui-select>
```

## Результат

![Видео-19-08-2025 07_58_42.mp4](uploads/9a54da6660c985bf43aa4033c67846e0/%D0%92%D0%B8%D0%B4%D0%B5%D0%BE-19-08-2025_07_58_42.mp4)

</details>

# Асинхронная работа

<details>
<summary>

Для того чтобы селект работал асинхронно, нужно создать **_`selectHandler`_**

</summary>

- **_`selectHandler`_**

```typescript
 protected usersSelectHandler: SelectHandler<User> = ({ pageNumber, pageCapacity, search }) => {
    return this.userService
      .getPaginated({
        pageNumber: pageNumber,
        pageCapacity: pageCapacity,
        ...(search && { search }),
      })
      .pipe(
        map(({ data, pagination }) => {
          return {
            options: data,
            metadata: {
              pageNumber: pagination.pageNumber,
              pageCapacity: pagination.pageCapacity,
              total: pagination.total,
            },
          }
        }),
      )
  }
```

- Передать его в **_`items`_**

  ```html
  <mui-select [items]="usersSelectHandler"></mui-select>
  ```

  ## Результат

  Теперь селект работает в **асинхронном режиме**, и реагирует на параметры запроса - **_`pageNumber, pageCapacity, search`_**

  ![Видео-19-08-2025 08_10_42.mp4](uploads/3e523d2ae43111fba56253e9badc1024/%D0%92%D0%B8%D0%B4%D0%B5%D0%BE-19-08-2025_08_10_42.mp4)

</details>

# Общие параметры

<details>
<summary>Общие параметры одиночного и множественного селектов</summary>

- **_`cleaner`_** - добавляет кнопку для очистки поля
- **_`strictMode`_** - строгий режим, при отключении позволяет вводить в поле любые значения
- **_`readOnly`_** - режим только для чтения
- **`withoutLabel`** - параметр который следует использовать если не хотите передать лейбл(TODO: попробовать реализовать туже логику без него)
- **_`groupLabel`_** - label внутри datalist для группы
- **_`emptyContent`_** - шаблон который будет использоваться при пустом списке
- **_`refresher`_** - subject который используется для обновления запроса, используйте если хотите обновить значение `items`

</details>

<details>
<summary>Передача шаблонов</summary>

- **_`label`_** - `<mui-select [items]="items">Label</mui-select>`
- **_`content`_** - контент в поле идущий после значения

  ```html
  <ng-container ngProjectAs="content">...code</ng-container>
  ```

- **_`beforeOptionsContentTemplate`_** - контент в поле идущий перед списком option, по аналогии с **_`content`_**
- **_`afterOptionsContentTemplate`_** - контент в поле идущий после списка option, по аналогии с **_`content`_**
- **_`optionTemplate`_** - шаблон для кнопки опции, **_item_** - это сущность из массива **_items_**

  ```html
  <mui-select>
    <ng-container *muiOption="let item; from: itemsHandler">
      ...code
    </ng-container>
  </mui-select>
  ```

</details>

# Множественный выбор

<details>
<summary>

Для того что сделать выбор множественный нужно передать **_`multiple`_**

</summary>

```html
<mui-select [items]="items" multiple></mui-select>
```

</details>

<details>
<summary>Параметры множественного селекта</summary>

- **_`checkedAll`_** - добавление кнопки "Выбрать все" в label группы
- **_`rows`_** - кол-во отображаемых строк в поле ввода
- **_`chipAppearance | chipIcon | chipHint`_** - Хендлер для передачи стиля, иконки или подсказки в каждый выбранный chip

  ```typescript
  chipAppearance: ChipAppearanceHandler<number> = ({ index, item }) => {
    return item > 2 ? 'accent' : 'info'
  }
  // Может быть использована так же и строка
  chipAppearance = 'accent'

  chipIcon: ChipHandler<number, string> = ({ index, item }) => {
    return item > 2 ? '@tui.box' : '@tui.x'
  }
  // Может быть использована так же и строка
  chipAppearance = '@tui.box'
  ```

</details>

# Примеры использование

<details>
<summary>

#### Синхронный

</summary>

```html
<mui-select
  [items]="currencies$"
  [stringify]="stringifyCurrency"
  formControlName="currencies"
  multiple>
  {{ t('brands.available-currencies') }}
</mui-select>
```

```typescript
//Component






protected currencies$ = this.currencyService.getList()
```

</details>

<details>
<summary>

#### Асинхронный

</summary>

```html
<mui-select
  [identityMatcher]="byId"
  [items]="callScriptsSelectHandler"
  [readOnly]="!callDeliveryForm.controls.user.value"
  [refresher]="refreshFields"
  [stringify]="stringifyCallScripts"
  (optionSelected)="callDeliveryForm.controls.user.updateValueAndValidity()"
  class="grow"
  formControlName="callScript">
  {{ t('call-scripts.call-script') }}
</mui-select>
```

```typescript
//Component






protected callScriptsSelectHandler: SelectHandler<CallScriptAPI> = ({
    pageNumber,
    pageCapacity,
    search,
  }) => {
    const user = this.callDeliveryForm.controls.user.value
    return this.callScriptService
      .getPaginated({
        pageNumber: pageNumber,
        pageCapacity: pageCapacity,
        ...(search && { search }),
        ...(user && { filters: [`user_id:COMPARISON_IN:${user.id}`] }),
      })
      .pipe(
        map(({ data, pagination }) => {
          return {
            options: data,
            metadata: {
              pageNumber: pagination.pageNumber,
              pageCapacity: pagination.pageCapacity,
              total: pagination.total,
            },
          }
        }),
      )
  }
```

</details>

<details>
<summary>

#### Оптимизация большого кол-ва элементов

</summary>

```html
@let directionInputLength = directionSelect.search$.value?.length ?? 0; @let
directions = (availableDirections$ | async) ?? [];
<mui-select
  [emptyContent]="
     directionInputLength >= 2
       ? t('shared.not-found')
       : t('shared.enter-characters-placeholder', { char: 2 })"
  [muiSkeleton]="directionsDataStatus().loading"
  [stringify]="stringifyDirection"
  (input)="this.searchDirection.next(directionSelect.search$.value)"
  class="col-span-3"
  #directionSelect
  formControlName="direction">
  {{ t('directions.direction') }}
</mui-select>
```

```typescript
protected directions$ =  directionService.getList().pipe(shareReplay()),

protected searchDirection = new Subject<string | null>()
protected availableDirections$ = this.searchDirection.pipe(
    startWith(null),
    switchMap(search =>
      this.directions$.pipe(
        map(data =>
          data.filter(el => {
            const direction = this.stringifyDirection(el).toLowerCase()
            return search && direction.includes(search.toLowerCase())
          }),
        ),
      ),
    ),
  )
```

</details>
