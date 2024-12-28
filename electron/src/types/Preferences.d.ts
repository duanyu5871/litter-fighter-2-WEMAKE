namespace Preferences {
  type BaseTemplate =
    | Partial<{
        key: string;
        title: string;
        description: string;
        hints: string;
      }>
    | undefined
    | null;

  type CheckboxTemplate =
    | Partial<
        BaseTemplate & {
          type: "checkbox";
          defaultValue: string;
        }
      >
    | undefined
    | null;

  type RadioOptionTemplate = Partial<BaseTemplate> | undefined | null;

  type RadioTemplate =
    | Partial<
        BaseTemplate & {
          type: "radio";
          options: RadioOptionTemplate[];
        }
      >
    | undefined
    | null;

  type InputTemplate =
    | Partial<
        BaseTemplate & {
          type: "input";
          defaultValue: string;
        }
      >
    | undefined
    | null;

  type Template = CheckboxTemplate | RadioTemplate | InputTemplate;

  type Section =
    | Partial<{
        title: string;
        description: string;
        hints: string;
        preferences: Template[];
      }>
    | undefined
    | null;

  interface SetTemplates {
    (sections?: Section[]): void;
  }
  interface SetPreferences {
    (kvs?: KeyValues | null | undefined): void;
  }
  interface RemovePreferences {
    (keys?: string[]): void;
  }
  type KeyValues = { [key in string]?: string };
}
