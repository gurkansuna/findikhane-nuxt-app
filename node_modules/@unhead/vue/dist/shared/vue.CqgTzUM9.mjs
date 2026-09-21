import { useScript as useScript$1 } from 'unhead/scripts';
import { getCurrentInstance, onMounted, isRef, watch, onScopeDispose, ref } from 'vue';
import { i as injectHead } from './vue.DKb5ZKVl.mjs';

function useScript(_input, _options) {
  const input = typeof _input === "string" ? { src: _input } : _input;
  const options = { ..._options };
  const head = options?.head || injectHead();
  options.head = head;
  const scope = getCurrentInstance();
  options.eventContext = scope;
  if (scope && typeof options.trigger === "undefined") {
    options.trigger = onMounted;
  } else if (isRef(options.trigger) || typeof options.trigger === "function" && options.trigger.length === 0) {
    const trigger = options.trigger;
    let off;
    options.trigger = new Promise((resolve) => {
      off = watch(trigger, (val) => {
        if (val) {
          resolve(true);
        }
      }, {
        immediate: true
      });
      onScopeDispose(() => resolve(false), true);
    }).then((val) => {
      off?.();
      return val;
    });
  }
  head._scriptStatusWatcher = head._scriptStatusWatcher || head.hooks.hook("script:updated", ({ script: s }) => {
    if (s._statusRef) {
      s._statusRef.value = s.status;
    }
  });
  const script = useScript$1(head, input, options);
  const scoped = options.scope === true;
  const sharedScript = scoped ? script.script : script;
  sharedScript._statusRef = sharedScript._statusRef || ref(sharedScript.status);
  let onLoaded = script.onLoaded;
  let onError = script.onError;
  if (scope) {
    if (scoped) {
      onScopeDispose(script.dispose);
    } else {
      const bind = (base) => (...args) => {
        const off = base(...args);
        onScopeDispose(off);
        return off;
      };
      onLoaded = bind(script.onLoaded);
      onError = bind(script.onError);
      const triggerAbortController = script._triggerAbortController;
      onScopeDispose(() => triggerAbortController?.abort());
    }
  }
  return new Proxy(script, {
    get(_, key, a) {
      if (key === "status")
        return sharedScript._statusRef;
      if (key === "onLoaded")
        return onLoaded;
      if (key === "onError")
        return onError;
      return Reflect.get(_, key, a);
    }
  });
}

export { useScript as u };
