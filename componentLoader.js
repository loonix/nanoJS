import { Blip, bindTemplate } from './nano.js';

function processLoop(template, context) {
    console.log("Starting loop processing...");
    
    return template.replace(/<loop values="(.*?)">(.*?)<\/loop>/gs, (_, loopExpression, loopContent) => {
        const [itemName, arrayName] = loopExpression.split(' in ').map(s => s.trim());
        console.log("Loop Expression:", { itemName, arrayName });

        let array = resolveNestedValue(arrayName, context);
        if (array instanceof Blip) {
            array = array.value;
        }

        console.log("Array found in context:", array);

        if (!Array.isArray(array)) {
            console.warn(`Expected an array for '${arrayName}', but got:`, array);
            return '';
        }

        return array.map((item, index) => {
            const loopContext = { [itemName]: item };
            const boundContent = bindTemplate(loopContent, { ...context, ...loopContext });
            console.log("Bound content for item:", boundContent);
            return boundContent;
        }).join('');
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

function createReactiveContext(context, render) {
    return new Proxy(context, {
        set(target, property, value) {
            target[property] = value;
            render();
            return true;
        }
    });
}

export async function loadComponent(url, mountPoint) {
    console.log(`Loading component from: ${url}`);
    const response = await fetch(url);
    const componentText = await response.text();
    console.log("Fetched component content:", componentText);

    const templateMatch = componentText.match(/<template>([\s\S]*?)<\/template>/);
    const scriptMatch = componentText.match(/<script>([\s\S]*?)<\/script>/);
    const styleMatch = componentText.match(/<style>([\s\S]*?)<\/style>/);

    const template = templateMatch ? templateMatch[1] : '';
    const scriptContent = scriptMatch ? scriptMatch[1] : '';
    const style = styleMatch ? styleMatch[1] : '';

    console.log("Extracted sections:", { template, scriptContent, style });

    const context = {};
    const BlipContext = { Blip };

    console.log("Executing script...");
    try {
        const scriptFunction = new Function('context', 'Blip', `
            ${scriptContent}
            context.title = title;
            context.items = items;
        `);

        scriptFunction(context, Blip);
        console.log("Script executed. Context after execution:", context);
    } catch (error) {
        console.error("Error executing script:", error);
    }

    const reactiveContext = createReactiveContext(context, render);

    function render() {
        console.log("Starting render...");
        let processedTemplate = processLoop(template, reactiveContext);
        const renderedTemplate = bindTemplate(processedTemplate, reactiveContext);

        console.log("Rendered template:", renderedTemplate);
        const mountEl = document.querySelector(mountPoint);
        if (mountEl) {
            mountEl.innerHTML = renderedTemplate;
        }
    }

    Object.values(context).forEach(value => {
        if (value instanceof Blip) {
            value.subscribe(() => {
                console.log("Reactive change detected. Re-rendering...");
                render();
            });
        }
    });

    render();

    if (style) {
        const styleElement = document.createElement('style');
        styleElement.textContent = style;
        document.head.appendChild(styleElement);
    }

    console.log("Component loaded and rendered successfully.");
}