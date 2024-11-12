export class Blip {
    constructor(initialValue) {
        this._value = initialValue;
        this._subscribers = new Set();
    }

    get value() {
        return this._value;
    }

    set value(newValue) {
        if (newValue !== this._value) {
            this._value = newValue;
            this._notify();
        }
    }

    subscribe(callback) {
        this._subscribers.add(callback);
        return () => this._subscribers.delete(callback);
    }

    _notify() {
        this._subscribers.forEach(callback => callback());
    }
}

export function bindTemplate(template, context) {
    return template.replace(/\{\{(.*?)\}\}/g, (_, expression) => {
        const value = resolveNestedValue(expression.trim(), context);
        return value instanceof Blip ? value.value : value !== undefined ? value : '';
    });
}

function resolveNestedValue(path, context) {
    return path.split('.').reduce((acc, key) => {
        if (acc && acc[key] !== undefined) {
            return acc[key];
        }
        return undefined;
    }, context);
}