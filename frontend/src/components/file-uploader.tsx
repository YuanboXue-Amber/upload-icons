"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  makeStyles,
  tokens,
  Button,
  Text,
  shorthands,
  Image,
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

export function FileUploader({ onFileChange }: FileUploaderProps) {
  const styles = useStyles();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [filePreview, setFilePreview] = useState<string>("");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        onFileChange(selectedFile);

        // Create a blob URL
        const objectUrl = URL.createObjectURL(selectedFile);
        setFilePreview(objectUrl);
      }
    },
    [onFileChange]
  );

  useEffect(() => {
    return () => {
      if (filePreview && filePreview.startsWith("blob:")) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

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

      {file && filePreview && (
        <div className={styles.previewContainer}>
          <Text className={styles.previewLabel} size={200} weight='semibold'>
            Image Preview:
          </Text>
          <div className={styles.previewImageWrapper}>
            <div className={styles.previewImage}>
              <Image
                src={filePreview || "/placeholder.svg"}
                alt='File preview'
                fit='contain'
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
