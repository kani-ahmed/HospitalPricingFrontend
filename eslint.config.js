import globals from "globals";
import pluginVue from "eslint-plugin-vue";


export default [
  { languageOptions: { globals: globals.browser } },
  ...pluginVue.configs["flat/essential"],
  {
    rules: {
      "vue/require-v-for-key": "off",
      "vue/multi-word-component-names": "off"
    }
  }
];