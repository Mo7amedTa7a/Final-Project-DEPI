// src/DoctorProfile.jsx
import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Nav,
  Badge,
  ProgressBar,
  Form,
} from "react-bootstrap";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import StarIcon from "@mui/icons-material/Star";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import "./Profile.css";

export default function DoctorProfile() {
  // UI-only: small local state to switch tabs visually
  const [tab, setTab] = useState("book");
  const [selectedSlot, setSelectedSlot] = useState("09:30 AM");
  const slots = [
    { label: "09:00 AM", disabled: true },
    { label: "09:30 AM" },
    { label: "10:00 AM" },
    { label: "10:30 AM" },
    { label: "11:00 AM" },
    { label: "11:30 AM" },
    { label: "01:00 PM", disabled: true },
    { label: "01:30 PM" },
  ];

  return (
    <div className="doctor-page">
      {/* Top Navbar */}
      <header className="site-header">
        <div className="header-left d-flex align-items-center gap-2">
          <HealthAndSafetyIcon className="brand-icon text-primary" fontSize="large" />
          <div className="brand-title">HealthConnect</div>
        </div>

        <nav className="header-center">
          <a href="#" className="muted-link">
            Home
          </a>
          <a href="#" className="active-link">
            Find Doctors
          </a>
          <a href="#" className="muted-link">
            Pharmacies
          </a>
          <a href="#" className="muted-link">
            My Appointments
          </a>
        </nav>

        <div className="header-right">
          <button className="icon-btn">
            <NotificationsNoneIcon />
          </button>
          <div className="avatar">
            <PersonOutlineIcon />
          </div>
        </div>
      </header>

      <Container className="main-container">
        <Row className="gx-4 gy-4">
          {/* LEFT */}
          <Col lg={3} md={4}>
            <Card className="card-smooth left-card">
              <div className="profile-wrap">
                <img
                  src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=600&auto=format&fit=crop&crop=faces"
                  alt="Dr"
                  className="profile-photo"
                />
                <span className="online-dot" />
              </div>

              <h4 className="doctor-name">Dr. Evelyn Reed</h4>
              <div className="doctor-role">Cardiologist</div>
              <div className="muted small">15 Years of Experience</div>

              <div className="rating-row">
                <StarIcon className="star-icon" />
                <strong>4.8</strong>
                <span className="muted small">(256 reviews)</span>
              </div>

              <Button variant="light" className="fav-btn">
                <FavoriteBorderIcon className="me-2" /> Add to Favorites
              </Button>
            </Card>
          </Col>

          {/* CENTER */}
          <Col lg={6} md={8}>
            <Card className="card-smooth center-card">
              <Card.Header className="tab-header p-0">
                <Nav variant="tabs" activeKey={tab} onSelect={(k) => setTab(k)}>
                  <Nav.Item>
                    <Nav.Link eventKey="details">Details</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="reviews">Reviews</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="book">Book Appointment</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>

              <Card.Body>
                {/* Title */}
                <h3 className="section-title">Select a Date &amp; Time</h3>

                {/* Calendar mock */}
                <div className="calendar-card">
                  <div className="calendar-header">
                    <button className="cal-nav">
                      <ArrowBackIosNewIcon fontSize="small" />
                    </button>
                    <div className="cal-title">October 2024</div>
                    <button className="cal-nav">
                      <ArrowForwardIosIcon fontSize="small" />
                    </button>
                  </div>

                  <div className="weekday-row">
                    <div>Su</div>
                    <div>Mo</div>
                    <div>Tu</div>
                    <div>We</div>
                    <div>Th</div>
                    <div>Fr</div>
                    <div>Sa</div>
                  </div>

                  <div className="dates-grid">
                    {/* A simplified static grid approximating your screenshot */}
                    {[
                      "29",
                      "30",
                      "1",
                      "2",
                      "3",
                      "4",
                      "5",
                      "6",
                      "7",
                      "8",
                      "9",
                      "10",
                      "11",
                      "12",
                      "13",
                      "14",
                      "15",
                      "16",
                      "17",
                      "18",
                      "19",
                      "20",
                      "21",
                      "22",
                      "23",
                      "24",
                      "25",
                      "26",
                    ].map((d, idx) => (
                      <div
                        key={idx}
                        className={`date-cell ${
                          d === "9"
                            ? "date-active"
                            : d === "29" || d === "30"
                            ? "date-muted"
                            : ""
                        }`}
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time slots */}
                <h6 className="mt-4 mb-2">
                  Available Slots for October 9, 2024
                </h6>
                <div className="slots-grid">
                  {slots.map((s) => (
                    <button
                      key={s.label}
                      className={`slot-btn ${
                        s.disabled
                          ? "disabled"
                          : selectedSlot === s.label
                          ? "active"
                          : ""
                      }`}
                      disabled={s.disabled}
                      onClick={() => !s.disabled && setSelectedSlot(s.label)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Reason */}
                <div className="mt-4">
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Reason for Visit
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Briefly describe your medical issue..."
                    />
                  </Form.Group>
                </div>

                <div className="d-grid mt-4">
                  <Button size="lg" className="primary-cta">
                    Book &amp; Proceed to Payment
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* RIGHT */}
          <Col lg={3} md={12}>
            <Card className="card-smooth mb-3 location-card">
              <Card.Body>
                <div className="d-flex align-items-start mb-3">
                  <LocationOnIcon className="me-2 text-primary" />
                  <div>
                    <div className="fw-semibold">Clinic Location</div>
                    <div className="muted small">
                      123 Health St, Wellness City, 10101
                    </div>
                  </div>
                </div>
                <div className="map-placeholder">
                  {/* static map-like image */}
                  <img
                    src="https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1200&auto=format&fit=crop"
                    alt="map"
                    className="img-fluid rounded"
                  />
                </div>
              </Card.Body>
            </Card>

            <Card className="card-smooth queue-card text-center">
              <Card.Body>
                <h6 className="fw-bold text-primary">Live Queue Status</h6>
                <div className="my-3">
                  <div className="muted small">Now Serving</div>
                  <div className="queue-number">#12</div>
                </div>

                <ProgressBar now={75} animated />

                <div className="mt-3 muted small">Your Turn (Est.)</div>
                <div className="fw-bold fs-5">~ 15 min</div>
                <div className="muted small mt-2">Last updated: just now</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
