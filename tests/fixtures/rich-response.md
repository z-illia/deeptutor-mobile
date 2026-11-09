# Імена — це ярлики на об’єктах

У Python **імена** вказують на об’єкти. Use `value is None`, `pages`, `worker_pages` and `append()`.

Другий абзац з *English emphasis* та ~~старим поясненням~~.

## Інтуїція

1. Створюємо список.
2. Прив’язуємо інше ім’я:
   - Мутація видима обом.
   - Вкладений список:
     - Unicode: ─ ┐ ├ ► ┘

### Код

```python
pages = ["page-1"]
worker_pages = pages
pages.append("page-2")
print(worker_pages)
```

```text
pages ─────────┐
               ├──► list A: ["page-1"]
worker_pages ──┘
```

```typescript
const same: boolean = pages === worker_pages;
```

#### Посилання

[Python Data model — Objects, values and types](https://docs.python.org/3/reference/datamodel.html#objects-values-and-types)

- [Copy documentation][copy]

[copy]: https://docs.python.org/3/library/copy.html

> Для None використовуй `is`.

| Перевірка | Значення | Ідентичність |
| :--- | :---: | ---: |
| `a == b` | Однакові | Не перевіряє |
| `a is b` | Не перевіряє | Той самий об’єкт |

---

##### Math

Inline $x^2 + y^2$ and display:

$$
E = mc^2
$$

###### Практика

- [x] Read
- [ ] Explain
