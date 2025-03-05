"use client";

import type React from "react";

import { useState } from "react";
import {
  Input,
  makeStyles,
  tokens,
  Text,
  Field,
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
      setError("");
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
    </div>
  );
}
