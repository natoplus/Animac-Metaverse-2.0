// src/components/CustomImage.js
import Image from "@tiptap/extension-image";

export const CustomImage = Image.extend({
  name: "image",

  addAttributes() {
    return {
      ...this.parent?.(),
      alignment: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-align") || "center",
        renderHTML: (attributes) => {
          return { "data-align": attributes.alignment || "center" };
        },
      },
      size: {
        default: "medium",
        parseHTML: (element) => element.getAttribute("data-size") || "medium",
        renderHTML: (attributes) => {
          return { "data-size": attributes.size || "medium" };
        },
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    // Apply class based on size
    let widthClass = "w-full";
    switch (HTMLAttributes.size) {
      case "small":
        widthClass = "w-1/4";
        break;
      case "medium":
        widthClass = "w-1/2";
        break;
      case "large":
        widthClass = "w-full";
        break;
      default:
        widthClass = "w-full";
    }

    // Alignment styles
    let style = "";
    if (HTMLAttributes.alignment === "left") style = "float:left; margin:0 1rem 1rem 0;";
    if (HTMLAttributes.alignment === "right") style = "float:right; margin:0 0 1rem 1rem;";
    if (HTMLAttributes.alignment === "center") style = "display:block; margin:1rem auto;";

    return ["img", { ...HTMLAttributes, class: widthClass, style }];
  },
});
