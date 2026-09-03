import { webMCPManager } from './manager';

export interface DeclarativeToolConfig {
  form: HTMLFormElement;
  toolName: string;
  description: string;
  autoSubmit: boolean;
}

class DeclarativeWebMCPEngine {
  private activeForms = new Map<string, DeclarativeToolConfig>();

  public registerForm(form: HTMLFormElement): () => void {
    const toolName = form.getAttribute('toolname');
    const description = form.getAttribute('tooldescription');
    const autoSubmit = form.hasAttribute('toolautosubmit');

    if (!toolName || !description) {
      return () => {};
    }

    // Synthesize JSON Schema from form inputs (§ 4.3)
    const properties: Record<string, any> = {};
    const required: string[] = [];

    const elements = Array.from(form.elements) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[];

    elements.forEach((el) => {
      const name = el.name;
      if (!name || el.type === 'submit' || el.type === 'button') return;

      const paramDesc = el.getAttribute('toolparamdescription') ||
        form.querySelector(`label[for="${el.id}"]`)?.textContent?.trim() ||
        el.getAttribute('aria-description') ||
        el.getAttribute('placeholder') ||
        name;

      if (el.tagName.toLowerCase() === 'select') {
        const select = el as HTMLSelectElement;
        const options = Array.from(select.options).map((opt) => opt.value);
        properties[name] = {
          type: 'string',
          enum: options,
          description: paramDesc
        };
      } else if (el.type === 'number') {
        properties[name] = {
          type: 'number',
          description: paramDesc
        };
      } else {
        properties[name] = {
          type: 'string',
          description: paramDesc
        };
      }

      if (el.required) {
        required.push(name);
      }
    });

    const config: DeclarativeToolConfig = {
      form,
      toolName,
      description,
      autoSubmit
    };

    this.activeForms.set(toolName, config);

    // Register declarative tool to ModelContext
    webMCPManager.registerTool({
      name: toolName,
      description,
      inputSchema: {
        type: 'object',
        properties,
        required
      },
      annotations: {
        readOnlyHint: false,
        untrustedContentHint: false
      },
      execute: async (input, { signal }) => {
        return this.executeDeclarativeTool(toolName, input, signal);
      }
    });

    return () => {
      this.activeForms.delete(toolName);
      webMCPManager.unregisterTool(toolName, 'FORM_UNMOUNTED');
    };
  }

  private async executeDeclarativeTool(
    toolName: string,
    input: Record<string, any>,
    signal?: AbortSignal
  ): Promise<string> {
    const config = this.activeForms.get(toolName);
    if (!config) {
      throw new Error(`Declarative tool form "${toolName}" not found.`);
    }

    const { form, autoSubmit } = config;

    // 1. Visual Activation via pseudo-classes and classes
    form.classList.add('tool-form-active');
    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
    if (submitBtn) {
      submitBtn.classList.add('tool-submit-active');
    }

    // Scroll form smoothly into view
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // 2. Fire window "toolactivated" event per spec § 4.3
    const activatedEvent = new CustomEvent('toolactivated', {
      detail: { toolName }
    });
    window.dispatchEvent(activatedEvent);

    // Handle abort during execution
    if (signal) {
      signal.addEventListener('abort', () => {
        form.classList.remove('tool-form-active');
        if (submitBtn) submitBtn.classList.remove('tool-submit-active');
        window.dispatchEvent(new CustomEvent('toolcancel', { detail: { toolName } }));
      }, { once: true });
    }

    // 3. Populate form fields
    for (const [key, value] of Object.entries(input)) {
      const field = form.elements.namedItem(key) as HTMLInputElement | HTMLSelectElement;
      if (field) {
        field.value = String(value);
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    // 4. Submission handling
    if (!autoSubmit) {
      return `Form fields populated for "${toolName}". Awaiting operator manual confirmation.`;
    }

    // Auto-submit with agentInvoked & respondWith handling
    return new Promise((resolve, reject) => {
      let responsePromiseResolved = false;

      // Custom synthetic submit event handling
      const submitHandler = (e: any) => {
        e.preventDefault();
        e.agentInvoked = true;

        let delegatedPromise: Promise<any> | null = null;
        e.respondWith = (promise: Promise<any>) => {
          delegatedPromise = promise;
        };

        // Allow form's attached submit listeners to run
        setTimeout(async () => {
          try {
            let resultPayload = 'Form submission completed.';
            if (delegatedPromise) {
              const res = await delegatedPromise;
              resultPayload = typeof res === 'string' ? res : JSON.stringify(res, null, 2);
            }
            responsePromiseResolved = true;

            // Cleanup visual states
            form.classList.remove('tool-form-active');
            if (submitBtn) submitBtn.classList.remove('tool-submit-active');

            resolve(resultPayload);
          } catch (err) {
            reject(err);
          }
        }, 300);
      };

      form.addEventListener('submit', submitHandler, { once: true });

      // Trigger submit
      const event = new Event('submit', { bubbles: true, cancelable: true });
      (event as any).agentInvoked = true;
      form.dispatchEvent(event);

      // Fallback timeout in case no respondWith handler resolved
      setTimeout(() => {
        if (!responsePromiseResolved) {
          form.classList.remove('tool-form-active');
          if (submitBtn) submitBtn.classList.remove('tool-submit-active');
          resolve(`Executed declarative tool "${toolName}" with parameters: ${JSON.stringify(input)}`);
        }
      }, 1500);
    });
  }
}

export const declarativeEngine = new DeclarativeWebMCPEngine();
