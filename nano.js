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
    console.log("Binding template with context:", context);
    return template.replace(/{{(.*?)}}/g, (_, key) => {
        try {
            const keys = key.trim().split('.');
            let value = keys.reduce((acc, k) => acc ? acc[k] : undefined, context);

            // If the value is a Blip, access its .value property
            if (value instanceof Blip) {
                value = value.value;
            }

            console.log(`Binding key: "${key}" with value:`, value);
            return value !== undefined ? value : '';
        } catch (error) {
            console.error(`Error binding template for key: "${key}"`, error);
            return '';
        }
    });
}


