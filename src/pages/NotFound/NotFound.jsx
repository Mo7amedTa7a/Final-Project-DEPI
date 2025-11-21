import React from "react";
import { useNavigate } from "react-router";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  useTheme,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const NotFound = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 4, sm: 6, md: 8 },
          textAlign: "center",
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.primary.main}05 100%)`,
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <ErrorOutlineIcon
            sx={{
              fontSize: { xs: 80, sm: 100, md: 120 },
              color: theme.palette.primary.main,
              opacity: 0.8,
            }}
          />
        </Box>

        {/* 404 Text */}
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "4rem", sm: "6rem", md: "8rem" },
            fontWeight: "bold",
            color: theme.palette.primary.main,
            mb: 2,
            lineHeight: 1,
          }}
        >
          404
        </Typography>

        {/* Title */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: theme.palette.text.primary,
            mb: 2,
            fontSize: { xs: "1.5rem", sm: "2rem" },
          }}
        >
          الصفحة غير موجودة
        </Typography>

        {/* Description */}
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            mb: 4,
            fontSize: { xs: "0.9rem", sm: "1rem" },
            maxWidth: "500px",
            mx: "auto",
          }}
        >
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. يرجى التحقق من الرابط والمحاولة مرة أخرى.
        </Typography>

        {/* Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexWrap: "wrap",
            mt: 4,
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate("/")}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            الصفحة الرئيسية
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            العودة للخلف
          </Button>
        </Box>

        {/* Additional Links */}
        <Box
          sx={{
            mt: 6,
            pt: 4,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              mb: 2,
            }}
          >
            صفحات مفيدة:
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="text"
              onClick={() => navigate("/finddoctor")}
              sx={{ textTransform: "none" }}
            >
              البحث عن طبيب
            </Button>
            <Button
              variant="text"
              onClick={() => navigate("/pharmacies")}
              sx={{ textTransform: "none" }}
            >
              الصيدليات
            </Button>
            <Button
              variant="text"
              onClick={() => navigate("/dashboard")}
              sx={{ textTransform: "none" }}
            >
              لوحة التحكم
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFound;

