"use client";

import type React from "react";

import { useState } from "react";
import {
  Input,
  makeStyles,
  tokens,
  Text,
  Field,
  shorthands,
  Image,
} from "@fluentui/react-components";

interface UrlInputProps {
  onUrlChange: (url: string) => void;
}

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
  errorText: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase200,
  },

  previewContainer: {
    ...shorthands.padding(tokens.spacingVerticalM),
    ...shorthands.border(
      tokens.strokeWidthThin,
      "solid",
      tokens.colorNeutralStroke1
    ),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    marginBottom: tokens.spacingVerticalL,
  },
  previewLabel: {
    marginBottom: tokens.spacingVerticalS,
  },
  previewImageWrapper: {
    display: "flex",
    justifyContent: "center",
  },
  previewImage: {
    position: "relative",
    height: "160px",
    width: "160px",
    ...shorthands.border(
      tokens.strokeWidthThin,
      "solid",
      tokens.colorNeutralStroke1
    ),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    overflow: "hidden",
  },
});

export function UrlInput({ onUrlChange }: UrlInputProps) {
  const styles = useStyles();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const validateUrl = (input: string) => {
    if (!input) {
      setError("");
      return;
    }

    try {
      new URL(input);
      if (
        !(
          input.startsWith("data:image/") ||
          (input.startsWith("http") &&
            (input.endsWith(".png") ||
              input.endsWith(".jpg") ||
              input.endsWith(".jpeg") ||
              input.endsWith(".gif") ||
              input.endsWith(".webp") ||
              input.endsWith(".svg")))
        )
      ) {
        setError("Please enter a valid Image URL");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      setError("Please enter a valid URL");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputUrl = e.target.value;
    setUrl(inputUrl);
    validateUrl(inputUrl);

    if (!error) {
      onUrlChange(inputUrl);
    } else {
      onUrlChange("");
    }
  };

  return (
    <div className={styles.container}>
      <Field label='Enter URL' validationState={error ? "error" : "none"}>
        <Input
          id='url-input'
          type='url'
          placeholder='https://example.com/icons'
          value={url}
          onChange={handleChange}
          appearance={"outline"}
        />
      </Field>
      {error && <Text className={styles.errorText}>{error}</Text>}

      {!error && url && (
        <div className={styles.previewContainer}>
          <Text className={styles.previewLabel} size={200} weight='semibold'>
            Image Preview:
          </Text>
          <div className={styles.previewImageWrapper}>
            <div className={styles.previewImage}>
              <Image
                src={url || "/placeholder.svg"}
                alt='URL preview'
                fit='contain'
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
