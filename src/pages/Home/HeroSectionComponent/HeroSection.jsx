// Bootstrap Components
import { Carousel } from "react-bootstrap";
// MUI Components
import { TextField, Button, Grid, useTheme } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const HeroSection = () => {
  const theme = useTheme();
  const images = [
    "/src/assets/4.jpg",
    "/src/assets/3.jpg",
    "/src/assets/2.jpg",
    "/src/assets/1.jpg",
  ];

  return (
    <Carousel fade controls={false} indicators={false} interval={3000}>
      {images.map((img, index) => (
        <Carousel.Item key={index}>
          <div
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: "100vh",
              position: "relative",
            }}
          >
            {/* overlay */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                 background: "linear-gradient(60deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.77), rgba(255, 255, 255, 1))",
                zIndex: 1,
              }}
            />

            {/*Start the search box*/}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "80%",
                maxWidth: "900px",
                zIndex: 2,
              }}
            >
              {/*Start The text above the search box */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                <h1
                  style={{
                    ...theme.typography.h1,
                    fontSize: { xs: "1.5rem", md: "3rem" },
                    marginBottom: "10px",
                    textShadow:
                      "1px 1px 1px rgba(0, 0, 0, 0.8), 0 0 10px rgba(0, 0, 0, 0.5)",
                    letterSpacing: "1px",
                  }}
                >
                  Search for Doctor or Pharmacy
                </h1>
                <p
                  style={{
                     fontSize: { xs: "1rem", md: "1.5rem" },
                     fontWeight:"bold",
                    color: "#1d1d1dff",
                    letterSpacing: "1px",
                  }}
                >
                  Find your healthcare provider easily
                </p>
              </div>
              {/*End The text above the search box  */}
              <Grid
                container
                spacing={2}
                alignItems="center"
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.95)",
                  p: 3,
                  borderRadius: "25px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                  flexDirection: { xs: "column", md: "row" },
                }}
              >
                <Grid item xs={12} md={8} sx={{ flex: 1, minWidth: 0 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Doctor or pharmacy name"
                    size="medium"
                  />
                </Grid>

                <Grid item xs={12} md={4} sx={{ flexShrink: 0 }}>
                  <Button
                    variant="contained"
                    color="error"
                    size="large"
                    startIcon={<SearchIcon />}
                    fullWidth
                    sx={{
                      fontWeight: "bold",
                      borderRadius: "15px",
                      py: 1.5,
                      fontSize: "1rem",
                    }}
                  >
                    Search
                  </Button>
                </Grid>
              </Grid>
            </div>
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default HeroSection;
