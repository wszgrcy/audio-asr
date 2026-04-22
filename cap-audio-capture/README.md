# cap-audio-capture

audio capture

## Install

To use npm

```bash
npm install cap-audio-capture
````

To use yarn

```bash
yarn add cap-audio-capture
```

Sync native files

```bash
npx cap sync
```

## API

<docgen-index>

* [`echo(...)`](#echo)
* [`start(...)`](#start)
* [`stop(...)`](#stop)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### echo(...)

```typescript
echo(options: { value: string; }) => Promise<{ value: string; }>
```

| Param         | Type                            |
| ------------- | ------------------------------- |
| **`options`** | <code>{ value: string; }</code> |

**Returns:** <code>Promise&lt;{ value: string; }&gt;</code>

--------------------


### start(...)

```typescript
start(options?: {} | undefined) => Promise<void>
```

| Param         | Type            |
| ------------- | --------------- |
| **`options`** | <code>{}</code> |

--------------------


### stop(...)

```typescript
stop(options?: {} | undefined) => Promise<void>
```

| Param         | Type            |
| ------------- | --------------- |
| **`options`** | <code>{}</code> |

--------------------

</docgen-api>
