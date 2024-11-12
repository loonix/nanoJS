
# NanoJS

**NanoJS** is a lightweight, dependency-free JavaScript framework designed to provide a simple, reactive experience for building web applications. Inspired by modern frameworks like Vue and Svelte, NanoJS focuses on minimalism and ease of use, allowing developers to build dynamic, reactive interfaces without the overhead of complex tooling.

## 🚀 Features

- **Reactive Signals**: Simple and efficient reactive data binding.
- **Component-Based Structure**: Modular architecture for building reusable components.
- **Zero Dependencies**: No need for npm, Node.js, or build tools. Just vanilla HTML, JavaScript, and CSS.
- **Lightweight and Fast**: Optimized for performance with minimal overhead.

## 📦 Installation

No installation is required! Just download the files and include them in your project.

```html
<script type="module" src="./nano.js"></script>
```

## 🛠 Usage

### 1. Setting Up Your Project

Create a project structure like this:

```
project/
├── index.html
├── nano.js
├── components/
│   └── MyComponent.html
```

### 2. Creating a Component

Create a component file, such as `MyComponent.html`:

```html
<template>
  <div>
    <h1>{{title}}</h1>
    <input type="text" oninput="updateTitle(event)" value="{{title}}" />
    <input type="text" id="itemInput" placeholder="Enter item name" />
    <button onclick="addItem()">Add Item</button>

    <loop values="item in items.value">
      <div>
        <span>Item: {{item.name}}</span>
        <button onclick="removeItem({{item.id}})">Remove</button>
      </div>
    </loop>
    
    <p>Total items: {{items.value.length}}</p>
  </div>
</template>

<script type="module">
  const title = new Blip('Hello, NanoJS!');
  const items = new Blip([{ id: 1, name: 'Item 1' }]);

  window.updateTitle = function(event) {
    title.value = event.target.value;
  };

  window.addItem = function() {
    const inputElement = document.getElementById('itemInput');
    const itemName = inputElement.value.trim();
    if (itemName) {
      items.value = [...items.value, { id: Date.now(), name: itemName }];
      inputElement.value = '';
    }
  };

  window.removeItem = function(itemId) {
    items.value = items.value.filter(item => item.id !== itemId);
  };
</script>

<style>
  h1 { color: #007acc; }
  button { margin: 5px; }
  input { margin-right: 10px; padding: 5px; }
  div { margin-bottom: 10px; }
</style>
```

### 3. Using the Component in `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My NanoJS App</title>
  <script type="module" src="./app.js"></script>
</head>
<body>
  <div id="app"></div>
</body>
</html>
```

### 4. `app.js`

```js
import { loadComponent } from './componentLoader.js';
loadComponent('./components/MyComponent.html', '#app');
```

## 🧩 API Reference

### `Blip`
The `Blip` class is used to create reactive variables.

```js
const title = new Blip('Hello, World!');
title.value = 'Updated Title';
```

### 🛡 Best Practices

1. Use `Blip` variables for reactive data.
2. Use modular components to keep your codebase organized and reusable.

## 🚦 Live Server

To test your NanoJS app locally, you can use Python's built-in server:

```bash
python3 -m http.server 8000
```

Then, open your browser and navigate to:
```
http://localhost:8000
```

## 🎯 Key Concepts

### Reactive Signals
NanoJS uses a simple reactive system. When the value of a `Blip` variable changes, all elements bound to it are updated automatically.

## 📝 License

