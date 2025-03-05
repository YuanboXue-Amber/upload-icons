import Image from "next/image";
import { makeStyles, tokens, Text } from "@fluentui/react-components";

export interface Icon {
  id: number;
  name: string;
  url: string;
  variant: string;
}

interface IconGridProps {
  icons: Icon[];
}

const useStyles = makeStyles({
  container: {
    marginTop: tokens.spacingVerticalXXL,
  },
  heading: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacingVerticalL,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: tokens.spacingHorizontalM,
    "@media (min-width: 640px)": {
      gridTemplateColumns: "repeat(3, 1fr)",
    },
    "@media (min-width: 768px)": {
      gridTemplateColumns: "repeat(4, 1fr)",
    },
    "@media (min-width: 1024px)": {
      gridTemplateColumns: "repeat(6, 1fr)",
    },
  },
  iconCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: tokens.spacingHorizontalM,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  imageContainer: {
    position: "relative",
    width: "64px",
    height: "64px",
    marginBottom: tokens.spacingVerticalS,
  },
  iconName: {
    fontSize: tokens.fontSizeBase200,
    textAlign: "center",
    width: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
});

export function IconGrid({ icons }: IconGridProps) {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <Text as='h2' className={styles.heading}>
        Search Results
      </Text>
      <div className={styles.grid}>
        {icons.map((icon) => (
          <div key={icon.id} className={styles.iconCard}>
            <div className={styles.imageContainer}>
              <Image
                src={icon.url || "/placeholder.svg"}
                alt={icon.name}
                fill
              />
            </div>
            <Text
              className={styles.iconName}
            >{`${icon.name} (${icon.variant})`}</Text>
          </div>
        ))}
      </div>
    </div>
  );
}
