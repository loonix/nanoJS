import { Blip, bindTemplate } from './nano.js';

function processLoop(template, context) {
    console.log("Starting loop processing...");
    
    return template.replace(/<loop values="(.*?)">(.*?)<\/loop>/gs, (_, loopExpression, loopContent) => {
        const [itemName, arrayName] = loopExpression.split(' in ').map(s => s.trim());
        console.log("Loop Expression:", { itemName, arrayName });

        // Resolve the nested value properly from the context
        let array = resolveNestedValue(arrayName, context);
        if (array instanceof Blip) {
            array = array.value; // Access the value if it's a Blip
        }

        console.log("Array found in context:", array);

        // Check if the array is valid
        if (!Array.isArray(array)) {
            console.warn(`Expected an array for '${arrayName}', but got:`, array);
            return '';
        }

        // Iterate over the array and bind each item
        return array.map((item, index) => {
            const loopContext = { [itemName]: item };
            const boundContent = bindTemplate(loopContent, { ...context, ...loopContext });
            console.log("Bound content for item:", boundContent);
            return boundContent;
        }).join('');
    });
}

// Helper function to resolve nested properties
function resolveNestedValue(path, context) {
    return path.split('.').reduce((acc, key) => {
        if (acc && acc[key] !== undefined) {
            return acc[key];
        }
        return undefined;
    }, context);
}




function processConditionals(template, context) {
    // Temporarily disable condition evaluation for debugging
    return template; 
}





// Function to evaluate conditions within the provided context
function evaluateCondition(condition, context) {
    console.log("Evaluating condition:", condition);
    console.log("Current context:", context);

    try {
        const contextEntries = Object.entries(context);
        const contextCode = contextEntries
            .map(([key, value]) => {
                const evaluatedValue = value instanceof Blip ? value.value : value;
                return `const ${key} = ${JSON.stringify(evaluatedValue)};`;
            })
            .join(' ');

        console.log("Generated context code for condition:", contextCode);
        const codeToEvaluate = `${contextCode} return (${condition});`;

        return eval(`(function() { ${codeToEvaluate} })()`);
    } catch (error) {
        console.error(`Error evaluating condition: ${condition}`, error);
        return false;
    }
}





function exposeContextToGlobal(context) {
    for (const key in context) {
        if (context.hasOwnProperty(key)) {
            window[key] = context[key];
        }
    }
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

    // Create a context object
    const context = {};
    const BlipContext = { Blip };

    // Execute the script and bind variables to context
    console.log("Executing script...");
    try {
        // Create a function that takes context and Blip, and assigns variables to context
        const scriptFunction = new Function('context', 'Blip', `
            ${scriptContent}
            context.title = title;
            context.items = items;
        `);

        // Execute the script function with the context and Blip
        scriptFunction(context, Blip);
        console.log("Script executed. Context after execution:", context);
    } catch (error) {
        console.error("Error executing script:", error);
    }

    function render() {
        console.log("Starting render...");
        let processedTemplate = processLoop(template, context);
        processedTemplate = processConditionals(processedTemplate, context);
        const renderedTemplate = bindTemplate(processedTemplate, context);

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

