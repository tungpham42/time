import React, { useState, useMemo } from "react";
import {
  Card,
  Select,
  DatePicker,
  Slider,
  Button,
  List,
  Typography,
  Space,
  Row,
  Col,
  Divider,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  HolderOutlined,
} from "@ant-design/icons";
import ct from "countries-and-timezones";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

// Extract all valid timezones
const allTimezones = Object.values(ct.getAllTimezones()).sort((a, b) =>
  a.name.localeCompare(b.name),
);

// Map common abbreviations to their IANA timezone equivalents
const commonAliases: Record<string, string[]> = {
  "America/Los_Angeles": ["PST", "PDT", "Pacific Time"],
  "America/New_York": ["EST", "EDT", "Eastern Time"],
  "America/Chicago": ["CST", "CDT", "Central Time"],
  "America/Denver": ["MST", "MDT", "Mountain Time"],
  "Europe/London": ["GMT", "BST"],
  "Europe/Paris": ["CET", "CEST"],
  "Asia/Ho_Chi_Minh": ["ICT", "Indochina Time", "Saigon"],
  "Asia/Bangkok": ["ICT", "Indochina Time"],
  "Asia/Tokyo": ["JST", "Japan Standard Time"],
  "Asia/Singapore": ["SGT", "Singapore Time"],
  "Asia/Kolkata": ["IST", "India Standard Time"],
  "Australia/Sydney": ["AEST", "AEDT"],
};

const TimezoneConverter: React.FC = () => {
  const [baseDate, setBaseDate] = useState<Date>(new Date());
  const [timeInMinutes, setTimeInMinutes] = useState<number>(
    new Date().getHours() * 60 + new Date().getMinutes(),
  );

  const getSafeLocalZone = () => {
    const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (localZone === "Asia/Saigon") return "Asia/Ho_Chi_Minh";
    if (localZone === "Asia/Calcutta") return "Asia/Kolkata";
    return localZone;
  };

  const [selectedZones, setSelectedZones] = useState<string[]>([
    getSafeLocalZone(),
    "UTC",
  ]);
  const [newZone, setNewZone] = useState<string | null>(null);

  // --- Drag and Drop States ---
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggableIndex, setDraggableIndex] = useState<number | null>(null);

  const exactTime = useMemo(() => {
    const d = new Date(baseDate);
    d.setHours(Math.floor(timeInMinutes / 60));
    d.setMinutes(timeInMinutes % 60);
    d.setSeconds(0);
    return d;
  }, [baseDate, timeInMinutes]);

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) setBaseDate(date.toDate());
  };

  const handleSetToNow = () => {
    const now = new Date();
    setBaseDate(now);
    setTimeInMinutes(now.getHours() * 60 + now.getMinutes());
  };

  const handleAddZone = () => {
    if (newZone && !selectedZones.includes(newZone)) {
      setSelectedZones([...selectedZones, newZone]);
      setNewZone(null);
    }
  };

  const handleRemoveZone = (zoneToRemove: string) => {
    setSelectedZones(selectedZones.filter((z) => z !== zoneToRemove));
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updatedZones = [...selectedZones];
    const draggedItem = updatedZones[draggedIndex];

    updatedZones.splice(draggedIndex, 1);
    updatedZones.splice(index, 0, draggedItem);

    setSelectedZones(updatedZones);
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDraggableIndex(null); // Safely reset the draggable lock
  };

  const getTzTimeInMinutes = (date: Date, timezone: string) => {
    try {
      const timeString = new Intl.DateTimeFormat("en-GB", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
      const [h, m] = timeString.split(":").map(Number);
      return h * 60 + m;
    } catch (e) {
      return 0;
    }
  };

  const handleZoneSliderChange = (zone: string, newZoneMinutes: number) => {
    const currentZoneMinutes = getTzTimeInMinutes(exactTime, zone);
    const diff = newZoneMinutes - currentZoneMinutes;

    let newTotalMinutes = timeInMinutes + diff;
    let newDate = new Date(baseDate);

    while (newTotalMinutes >= 1440) {
      newTotalMinutes -= 1440;
      newDate.setDate(newDate.getDate() + 1);
    }
    while (newTotalMinutes < 0) {
      newTotalMinutes += 1440;
      newDate.setDate(newDate.getDate() - 1);
    }

    setBaseDate(newDate);
    setTimeInMinutes(newTotalMinutes);
  };

  const formatTimeForZone = (date: Date, timezone: string) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    } catch (e) {
      return "Invalid";
    }
  };

  const formatDateForZone = (date: Date, timezone: string) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(date);
    } catch (e) {
      return "";
    }
  };

  const sliderTooltipFormatter = (value: number | undefined) => {
    if (value === undefined) return "";
    const h = Math.floor(value / 60);
    const m = value % 60;

    const ampm = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 === 0 ? 12 : h % 12;

    const formattedHour = displayHour.toString().padStart(2, "0");
    const formattedMinute = m.toString().padStart(2, "0");

    return `${formattedHour}:${formattedMinute} ${ampm}`;
  };

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: "24px",
        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.08)",
        padding: "12px",
      }}
    >
      <Row gutter={[24, 24]} align="bottom">
        <Col xs={24} sm={10} md={8}>
          <Space direction="vertical" style={{ width: "100%" }} size="small">
            <Row justify="space-between" align="middle" wrap={false}>
              <Text
                type="secondary"
                strong
                style={{
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                <CalendarOutlined style={{ marginRight: "6px" }} /> Reference
                Date
              </Text>
              <Button
                type="dashed"
                size="small"
                icon={<ClockCircleOutlined />}
                onClick={handleSetToNow}
                style={{
                  borderRadius: "12px",
                  color: "#FF7E67",
                  borderColor: "#FF7E67",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                Now
              </Button>
            </Row>
            <DatePicker
              size="large"
              style={{ width: "100%", borderRadius: "12px" }}
              value={dayjs(baseDate)}
              onChange={handleDateChange}
              allowClear={false}
            />
          </Space>
        </Col>

        <Col xs={24} sm={14} md={16}>
          <Space direction="vertical" style={{ width: "100%" }} size="small">
            <Text
              type="secondary"
              strong
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Add Location
            </Text>
            <Space.Compact style={{ width: "100%" }}>
              <Select
                showSearch
                size="large"
                style={{ width: "100%" }}
                placeholder="Search a city or timezone..."
                value={newZone}
                onChange={(val) => setNewZone(val)}
                filterOption={(input, option) => {
                  const rawTzName = (option?.value as string).toLowerCase();
                  const formattedTzName = rawTzName.replaceAll("_", " ");
                  const searchInput = input.toLowerCase();

                  if (rawTzName.includes(searchInput)) return true;
                  if (formattedTzName.includes(searchInput)) return true;

                  const aliases = commonAliases[option?.value as string] || [];
                  return aliases.some((alias) =>
                    alias.toLowerCase().includes(searchInput),
                  );
                }}
              >
                {allTimezones.map((tz) => {
                  const aliasText = commonAliases[tz.name]
                    ? ` [${commonAliases[tz.name].join(", ")}]`
                    : "";
                  return (
                    <Option key={tz.name} value={tz.name}>
                      {tz.name.replaceAll("_", " ")}
                      <Text
                        type="secondary"
                        style={{ fontSize: "12px", marginLeft: "8px" }}
                      >
                        {aliasText} (UTC{tz.utcOffsetStr})
                      </Text>
                    </Option>
                  );
                })}
              </Select>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={handleAddZone}
                disabled={!newZone}
                style={{
                  borderTopRightRadius: "12px",
                  borderBottomRightRadius: "12px",
                }}
              >
                Add
              </Button>
            </Space.Compact>
          </Space>
        </Col>
      </Row>

      <Divider style={{ margin: "32px 0" }} />

      <List
        dataSource={selectedZones}
        split={false}
        rowKey={(zone) => zone}
        renderItem={(zone, index) => (
          <div
            draggable={draggableIndex === index} // <-- ONLY draggable if state matches
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            style={{
              opacity: draggedIndex === index ? 0.4 : 1,
              transition: "opacity 0.2s ease",
            }}
          >
            <List.Item style={{ padding: "0 0 24px 0", border: "none" }}>
              <Card
                bordered={false}
                style={{
                  width: "100%",
                  background:
                    "linear-gradient(145deg, #ffffff 0%, #fafafa 100%)",
                  borderRadius: "16px",
                  border: "1px solid #f0f0f0",
                }}
                bodyStyle={{ padding: "20px 24px" }}
              >
                <Row
                  justify="space-between"
                  align="middle"
                  style={{ marginBottom: "16px" }}
                >
                  <Col style={{ display: "flex", alignItems: "center" }}>
                    <div
                      onMouseDown={() => setDraggableIndex(index)}
                      onMouseUp={() => setDraggableIndex(null)}
                      onTouchStart={() => setDraggableIndex(index)}
                      onTouchEnd={() => setDraggableIndex(null)}
                      style={{
                        padding: "8px",
                        margin: "-8px 8px -8px -8px", // Increases clickable hit area
                        cursor: draggedIndex === index ? "grabbing" : "grab",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <HolderOutlined
                        style={{
                          fontSize: "20px",
                          color: "#cbd5e1",
                        }}
                      />
                    </div>
                    <div>
                      <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                        {zone.split("/").pop()?.replaceAll("_", " ")}
                      </Title>
                      <Text
                        style={{
                          color: "#718096",
                          fontSize: "14px",
                          fontWeight: 500,
                        }}
                      >
                        {formatDateForZone(exactTime, zone)}
                      </Text>
                    </div>
                  </Col>

                  {/* Updated Right Column with Time and Delete Button */}
                  <Col
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: 800,
                        background: "linear-gradient(45deg, #FF7E67, #FF5A5F)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        lineHeight: 1.1,
                        marginRight: "16px",
                      }}
                    >
                      {formatTimeForZone(exactTime, zone)}
                    </div>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined style={{ fontSize: "18px" }} />}
                      onClick={() => handleRemoveZone(zone)}
                      disabled={selectedZones.length <= 1}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col span={24}>
                    <Slider
                      min={0}
                      max={1439}
                      step={15}
                      value={getTzTimeInMinutes(exactTime, zone)}
                      onChange={(val) => handleZoneSliderChange(zone, val)}
                      tooltip={{ formatter: sliderTooltipFormatter }}
                      marks={{
                        0: "12 AM",
                        360: "6 AM",
                        720: "12 PM",
                        1080: "6 PM",
                        1439: "11:59 PM",
                      }}
                    />
                  </Col>
                </Row>
              </Card>
            </List.Item>
          </div>
        )}
      />
    </Card>
  );
};

export default TimezoneConverter;
