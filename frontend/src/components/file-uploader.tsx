"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  makeStyles,
  tokens,
  Button,
  Text,
  shorthands,
} from "@fluentui/react-components";

import {
  ArrowUpRegular,
  DocumentRegular,
  DismissRegular,
} from "@fluentui/react-icons";

interface FileUploaderProps {
  onFileChange: (file: File | null) => void;
}

const useStyles = makeStyles({
  container: {
    width: "100%",
  },
  dropzone: {
    border: `2px dashed ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingVerticalXXL,
    transition: "all 0.2s ease",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "200px",
  },
  dropzoneActive: {
    ...shorthands.borderColor(tokens.colorBrandBackground),
    backgroundColor: tokens.colorBrandBackgroundInverted,
  },
  icon: {
    fontSize: "32px",
    color: tokens.colorNeutralForeground3,
    marginBottom: tokens.spacingVerticalM,
  },
  text: {
    textAlign: "center",
    color: tokens.colorNeutralForeground3,
    marginBottom: tokens.spacingVerticalS,
  },
  button: {
    marginTop: tokens.spacingVerticalM,
  },
  filePreview: {
    marginTop: tokens.spacingVerticalM,
    padding: tokens.spacingHorizontalM,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
  },
  fileName: {
    marginLeft: tokens.spacingHorizontalS,
    fontWeight: tokens.fontWeightSemibold,
    maxWidth: "250px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  removeButton: {
    minWidth: "32px",
    height: "32px",
  },
});

export function FileUploader({ onFileChange }: FileUploaderProps) {
  const styles = useStyles();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        onFileChange(selectedFile);
      }
    },
    [onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  const removeFile = () => {
    setFile(null);
    onFileChange(null);
  };

  return (
    <div className={styles.container}>
      <div
        {...getRootProps()}
        className={`${styles.dropzone} ${
          isDragActive || isDragging ? styles.dropzoneActive : ""
        }`}
      >
        <input {...getInputProps()} />
        <ArrowUpRegular className={styles.icon} />
        <Text className={styles.text}>
          Drag & drop a file here, or click to select a file
        </Text>
        <Button appearance='outline' className={styles.button}>
          Select File
        </Button>
      </div>

      {file && (
        <div className={styles.filePreview}>
          <div className={styles.fileInfo}>
            <DocumentRegular />
            <span className={styles.fileName}>{file.name}</span>
          </div>
          <Button
            appearance='subtle'
            icon={<DismissRegular />}
            onClick={removeFile}
            className={styles.removeButton}
            aria-label='Remove file'
          />
        </div>
      )}
    </div>
  );
}
