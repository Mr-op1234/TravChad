"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TripData, INITIAL_TRIPS, getStoredTrips, saveStoredTrips } from "@/lib/tripsData";
import { compressImageFile, compressDataUrl } from "@/lib/imageUtils";

type Trip = TripData;

const FALLBACK_IMGS = [
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=900&q=80",
];

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Dashboard() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);

  useEffect(() => {
    const stored = getStoredTrips();
    setTrips(stored);
  }, []);
  const [activeNav, setActiveNav] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"upcoming" | "date" | "name" | "duration">("upcoming");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Dropdowns
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  // Modals
  const [detailTrip, setDetailTrip] = useState<Trip | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    status: "upcoming" as "upcoming" | "completed",
    image: "",
    description: "",
  });
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("upload");
  const [tripImageDragActive, setTripImageDragActive] = useState(false);
  const tripImageFileInputRef = useRef<HTMLInputElement>(null);

  const handleTripImageFile = async (file: File) => {
    try {
      const compressed = await compressImageFile(file, 1600, 1000, 0.78);
      setFormData((prev) => ({ ...prev, image: compressed }));
      showToast("Image selected & compressed");
    } catch (err) {
      console.error("Failed to process trip image:", err);
      showToast("Failed to process image");
    }
  };

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 2500);
  };

  const closeAllMenus = () => {
    setNotifOpen(false);
    setProfileOpen(false);
    setSortOpen(false);
    setActiveActionMenuId(null);
  };

  // Filter & Sort
  const filteredAndSortedTrips = useMemo(() => {
    let result = trips.filter((t) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q)
      );
    });

    result.sort((a, b) => {
      if (sortBy === "upcoming") {
        const rankA = a.status === "upcoming" ? 0 : 1;
        const rankB = b.status === "upcoming" ? 0 : 1;
        return rankA - rankB || a.startDate.localeCompare(b.startDate);
      }
      if (sortBy === "date") {
        return b.startDate.localeCompare(a.startDate);
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "duration") {
        return b.days - a.days;
      }
      return 0;
    });

    return result;
  }, [trips, searchQuery, sortBy]);

  const openAddForm = () => {
    setEditingTrip(null);
    setImageInputMode("upload");
    setFormData({
      name: "",
      startDate: "",
      endDate: "",
      status: "upcoming",
      image: "",
      description: "",
    });
    setFormOpen(true);
  };

  const openEditForm = (trip: Trip) => {
    setEditingTrip(trip);
    setImageInputMode("upload");
    setFormData({
      name: trip.name,
      startDate: trip.startDate,
      endDate: trip.endDate,
      status: trip.status,
      image: trip.heroImage || trip.image || "",
      description: trip.description,
    });
    setFormOpen(true);
  };

  const handleDeleteTrip = (id: string) => {
    setTrips((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveStoredTrips(next);
      return next;
    });
    showToast("Trip deleted");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.endDate) return;

    if (formData.endDate < formData.startDate) {
      showToast("End date must be after the start date");
      return;
    }

    const days =
      Math.round(
        (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) /
          86400000
      ) + 1;

    let img = formData.image.trim();
    if (img) {
      try {
        img = await compressDataUrl(img, 1600, 1000, 0.78);
      } catch {
        // use img as is
      }
    } else {
      img = FALLBACK_IMGS[Math.floor(Math.random() * FALLBACK_IMGS.length)];
    }

    const desc =
      formData.description.trim() || "A brand-new adventure waiting to happen.";

    if (editingTrip) {
      setTrips((prev) => {
        const next = prev.map((t) =>
          t.id === editingTrip.id
            ? {
                ...t,
                name: formData.name,
                startDate: formData.startDate,
                endDate: formData.endDate,
                status: formData.status,
                image: img,
                heroImage: img,
                description: desc,
                days,
              }
            : t
        );
        saveStoredTrips(next);
        return next;
      });
      showToast("Trip updated");
    } else {
      const newTrip: Trip = {
        id: Date.now().toString(),
        name: formData.name,
        tagline: "EXPLORE · DISCOVER · EXPERIENCE",
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        heroImage: img,
        description: desc,
        days,
        events: [],
      };
      setTrips((prev) => {
        const next = [newTrip, ...prev];
        saveStoredTrips(next);
        return next;
      });
      showToast("Trip added to your list");
    }

    setFormOpen(false);
    setEditingTrip(null);
  };

  return (
    <div
      className="flex min-h-screen bg-[#eef2f7] text-[#334155]"
      onClick={() => closeAllMenus()}
    >
      {/* ============ SIDEBAR ============ */}
      <aside className="w-[230px] shrink-0 bg-[#fbfcfe] border-r border-[#e6ecf4] p-[22px_16px_24px] hidden md:flex flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-[11px] px-2 py-0.5">
          <svg
            className="w-[27px] height-[27px] text-[#2563eb] rotate-45 shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
          <span className="text-[20px] font-extrabold text-[#172554] tracking-[-0.2px]">
            TripMate
          </span>
        </div>

        <nav className="mt-9 flex flex-col gap-1.5">
          <button
            onClick={() => setActiveNav("home")}
            className={`flex items-center gap-[13px] px-[14px] py-[11px] rounded-[10px] text-[15px] font-medium transition text-left ${
              activeNav === "home"
                ? "bg-[#e8f0fe] text-[#2563eb] font-semibold"
                : "text-[#3d4a5c] hover:bg-[#f0f4fa]"
            }`}
          >
            <svg
              className={`w-5 h-5 shrink-0 ${
                activeNav === "home" ? "text-[#2563eb]" : "text-[#64748b]"
              }`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 3.2 3.5 10v9.3A1.7 1.7 0 0 0 5.2 21h4.3v-6.2h5V21h4.3a1.7 1.7 0 0 0 1.7-1.7V10L12 3.2z" />
            </svg>
            Home
          </button>
          <button
            onClick={() => {
              setActiveNav("trips");
              showToast('Navigated to "My Trips" (demo)');
            }}
            className={`flex items-center gap-[13px] px-[14px] py-[11px] rounded-[10px] text-[15px] font-medium transition text-left ${
              activeNav === "trips"
                ? "bg-[#e8f0fe] text-[#2563eb] font-semibold"
                : "text-[#3d4a5c] hover:bg-[#f0f4fa]"
            }`}
          >
            <svg
              className="w-5 h-5 shrink-0 text-[#64748b]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2.5" y="7" width="19" height="13.5" rx="2.5" />
              <path d="M16 7V5.2A2.2 2.2 0 0 0 13.8 3h-3.6A2.2 2.2 0 0 0 8 5.2V7" />
              <path d="M2.5 12.5h19" />
            </svg>
            My Trips
          </button>
          <button
            onClick={() => {
              setActiveNav("explore");
              showToast('Navigated to "Explore" (demo)');
            }}
            className={`flex items-center gap-[13px] px-[14px] py-[11px] rounded-[10px] text-[15px] font-medium transition text-left ${
              activeNav === "explore"
                ? "bg-[#e8f0fe] text-[#2563eb] font-semibold"
                : "text-[#3d4a5c] hover:bg-[#f0f4fa]"
            }`}
          >
            <svg
              className="w-5 h-5 shrink-0 text-[#64748b]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9.2" />
              <polygon
                points="16.2 7.8 14.1 14.1 7.8 16.2 9.9 9.9 16.2 7.8"
                fill="currentColor"
                stroke="none"
              />
            </svg>
            Explore
          </button>
          <button
            onClick={() => {
              setActiveNav("saved");
              showToast('Navigated to "Saved" (demo)');
            }}
            className={`flex items-center gap-[13px] px-[14px] py-[11px] rounded-[10px] text-[15px] font-medium transition text-left ${
              activeNav === "saved"
                ? "bg-[#e8f0fe] text-[#2563eb] font-semibold"
                : "text-[#3d4a5c] hover:bg-[#f0f4fa]"
            }`}
          >
            <svg
              className="w-5 h-5 shrink-0 text-[#64748b]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
            Saved
          </button>
        </nav>

        <div className="mt-auto flex flex-col gap-1.5">
          <button
            onClick={() => showToast('Navigated to "Settings" (demo)')}
            className="flex items-center gap-[13px] px-[14px] py-[11px] rounded-[10px] text-[15px] font-medium text-[#3d4a5c] hover:bg-[#f0f4fa] transition text-left"
          >
            <svg
              className="w-5 h-5 shrink-0 text-[#64748b]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8.6 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </button>
          <button
            onClick={() => showToast("You have been logged out (demo)")}
            className="flex items-center gap-[13px] px-[14px] py-[11px] rounded-[10px] text-[15px] font-medium text-[#3d4a5c] hover:bg-[#f0f4fa] transition text-left"
          >
            <svg
              className="w-5 h-5 shrink-0 text-[#64748b]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log Out
          </button>
        </div>
      </aside>

      {/* ============ MAIN CONTENT ============ */}
      <main className="flex-1 min-w-0 p-6 md:p-[24px_28px_48px]">
        {/* Topbar */}
        <header className="flex items-start justify-between gap-5 mb-5 flex-wrap">
          <div>
            <h1 className="text-[28px] md:text-[30px] font-extrabold text-[#172554] tracking-[-0.3px]">
              Hello, Alex!
            </h1>
            <p className="text-[16px] text-[#64748b] mt-1.5">
              Where will your next adventure take you?
            </p>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-[180px] md:w-[256px] h-[38px] bg-white border border-[#e6ecf4] rounded-[9px] flex items-center gap-[9px] px-[13px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <svg
                className="w-4 h-4 text-[#94a3b8] shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.4" y2="16.4" />
              </svg>
              <input
                type="text"
                placeholder="Search trips, destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-none outline-none flex-1 text-[13.5px] text-[#1e293b] bg-transparent min-w-0 placeholder-[#94a3b8]"
              />
            </div>

            {/* Notifications */}
            <div
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  const state = notifOpen;
                  closeAllMenus();
                  setNotifOpen(!state);
                }}
                className="w-10 h-10 border-none bg-transparent rounded-[10px] grid place-items-center text-[#334155] hover:bg-[#e7edf6] transition"
                aria-label="Notifications"
              >
                <svg
                  className="w-[21px] h-[21px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </button>

              {notifOpen && (
                <div className="absolute top-[calc(100%+9px)] right-0 bg-white border border-[#e6ecf4] rounded-[12px] shadow-[0_14px_34px_rgba(15,23,42,0.14)] p-2 z-50 w-[330px]">
                  <div className="flex gap-3 items-start p-2.5 rounded-[9px] hover:bg-[#f6f8fc] transition cursor-pointer">
                    <span className="w-[34px] h-[34px] rounded-full grid place-items-center shrink-0 bg-[#e8f0fe] text-[#2563eb]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-[13.5px] font-medium text-[#1e293b] leading-[1.4]">
                        Your trip to Italy starts in 3 weeks — time to plan!
                      </p>
                      <span className="text-[12px] text-[#94a3b8] mt-0.5 block">2h ago</span>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start p-2.5 rounded-[9px] hover:bg-[#f6f8fc] transition cursor-pointer">
                    <span className="w-[34px] h-[34px] rounded-full grid place-items-center shrink-0 bg-[#dcfce7] text-[#16a34a]">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-[13.5px] font-medium text-[#1e293b] leading-[1.4]">
                        Price alert: flights to Tokyo dropped 18%.
                      </p>
                      <span className="text-[12px] text-[#94a3b8] mt-0.5 block">1d ago</span>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start p-2.5 rounded-[9px] hover:bg-[#f6f8fc] transition cursor-pointer">
                    <span className="w-[34px] h-[34px] rounded-full grid place-items-center shrink-0 bg-[#fef3c7] text-[#d97706]">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <line x1="12" y1="7" x2="12" y2="12" />
                        <line x1="12" y1="15.5" x2="12.01" y2="15.5" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-[13.5px] font-medium text-[#1e293b] leading-[1.4]">
                        Reminder: upload passport details for Japan.
                      </p>
                      <span className="text-[12px] text-[#94a3b8] mt-0.5 block">2d ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  const state = profileOpen;
                  closeAllMenus();
                  setProfileOpen(!state);
                }}
                className="flex items-center gap-2.5 p-[4px_6px_4px_4px] rounded-[10px] hover:bg-[#e7edf6] transition"
              >
                <img
                  className="w-[38px] h-[38px] rounded-full object-cover"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80"
                  alt="Alex Rivera"
                />
                <span className="text-[15px] font-semibold text-[#1e293b] whitespace-nowrap hidden sm:inline">
                  Alex Rivera
                </span>
                <svg
                  className="w-[15px] h-[15px] text-[#64748b]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {profileOpen && (
                <div className="absolute top-[calc(100%+9px)] right-0 bg-white border border-[#e6ecf4] rounded-[12px] shadow-[0_14px_34px_rgba(15,23,42,0.14)] p-1.5 z-50 min-w-[180px]">
                  <button
                    onClick={() => {
                      closeAllMenus();
                      showToast('"My Profile" — demo action');
                    }}
                    className="flex items-center gap-2.5 w-full p-[9px_12px] rounded-[8px] text-[13.5px] font-medium text-[#334155] hover:bg-[#f1f5f9] transition text-left"
                  >
                    <svg
                      className="w-4 h-4 text-[#64748b]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      closeAllMenus();
                      showToast('"Settings" — demo action');
                    }}
                    className="flex items-center gap-2.5 w-full p-[9px_12px] rounded-[8px] text-[13.5px] font-medium text-[#334155] hover:bg-[#f1f5f9] transition text-left"
                  >
                    <svg
                      className="w-4 h-4 text-[#64748b]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8.6 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      closeAllMenus();
                      showToast("You have been logged out (demo)");
                    }}
                    className="flex items-center gap-2.5 w-full p-[9px_12px] rounded-[8px] text-[13.5px] font-medium text-[#dc2626] hover:bg-[#f1f5f9] transition text-left"
                  >
                    <svg
                      className="w-4 h-4 text-[#dc2626]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Hero Banner */}
        <section className="relative h-[180px] rounded-[14px] overflow-hidden shadow-[0_10px_24px_rgba(23,37,84,0.10)] mb-7">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80"
            alt="Mountains at sunset"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(8,15,35,0.45)] via-[rgba(8,15,35,0.12)] to-[rgba(8,15,35,0.28)]" />
          <div className="absolute left-6 md:left-10 top-6 md:top-[30px] z-10 font-caveat font-semibold text-[34px] md:text-[44px] leading-[1.08] text-white -rotate-[2.5deg] drop-shadow-[0_2px_14px_rgba(0,0,0,0.4)]">
            <span>Collect Experiences</span>
            <br />
            <span className="inline-block relative pl-[54px]">
              Not Things
              <svg
                className="absolute -left-1.5 -bottom-3 w-[176px] h-4"
                viewBox="0 0 180 16"
                fill="none"
              >
                <path
                  d="M4 12 C 52 3, 128 3, 176 9"
                  stroke="#fff"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </div>
          <div className="absolute right-5 md:right-[34px] bottom-5 md:bottom-[28px] z-10 font-playfair italic font-medium text-[16px] md:text-[19px] tracking-[0.4px] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
            Plan. Explore. Travel. Repeat.
            <div className="w-[78px] h-0.5 rounded bg-white mt-2.5 ml-auto" />
          </div>
        </section>

        {/* Section Head */}
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <h2 className="text-[22px] font-extrabold text-[#172554] tracking-[-0.2px]">
            My Trips
          </h2>
          <div className="flex items-center gap-3.5 flex-wrap">
            <span className="text-[15px] font-medium text-[#475569] mr-0.5">
              Sort by
            </span>
            <div
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  const state = sortOpen;
                  closeAllMenus();
                  setSortOpen(!state);
                }}
                className="flex items-center justify-between gap-[22px] min-w-[148px] px-[13px] py-[9px] bg-white border border-[#e2e8f0] rounded-[9px] text-[14px] font-medium text-[#1e293b] shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-[#cbd7ea] transition"
              >
                <span>
                  {sortBy === "upcoming" && "Upcoming"}
                  {sortBy === "date" && "Most recent"}
                  {sortBy === "name" && "Name (A–Z)"}
                  {sortBy === "duration" && "Longest trip"}
                </span>
                <svg
                  className="w-[15px] h-[15px] text-[#64748b]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {sortOpen && (
                <div className="absolute top-[calc(100%+9px)] right-0 bg-white border border-[#e6ecf4] rounded-[12px] shadow-[0_14px_34px_rgba(15,23,42,0.14)] p-1.5 z-50 min-w-[172px]">
                  <button
                    onClick={() => {
                      setSortBy("upcoming");
                      closeAllMenus();
                    }}
                    className="flex items-center gap-2.5 w-full p-[9px_12px] rounded-[8px] text-[13.5px] font-medium text-[#334155] hover:bg-[#f1f5f9] transition text-left"
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("date");
                      closeAllMenus();
                    }}
                    className="flex items-center gap-2.5 w-full p-[9px_12px] rounded-[8px] text-[13.5px] font-medium text-[#334155] hover:bg-[#f1f5f9] transition text-left"
                  >
                    Most recent
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("name");
                      closeAllMenus();
                    }}
                    className="flex items-center gap-2.5 w-full p-[9px_12px] rounded-[8px] text-[13.5px] font-medium text-[#334155] hover:bg-[#f1f5f9] transition text-left"
                  >
                    Name (A–Z)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("duration");
                      closeAllMenus();
                    }}
                    className="flex items-center gap-2.5 w-full p-[9px_12px] rounded-[8px] text-[13.5px] font-medium text-[#334155] hover:bg-[#f1f5f9] transition text-left"
                  >
                    Longest trip
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-[9px]">
              <button
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                className={`w-[38px] h-[38px] rounded-[10px] bg-white border grid place-items-center transition shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${
                  viewMode === "grid"
                    ? "text-[#2563eb] border-[#c5d6f8]"
                    : "text-[#94a3b8] border-[#e2e8f0] hover:text-[#475569]"
                }`}
              >
                <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3.5" y="3.5" width="7.2" height="7.2" rx="1.6" />
                  <rect x="13.3" y="3.5" width="7.2" height="7.2" rx="1.6" />
                  <rect x="3.5" y="13.3" width="7.2" height="7.2" rx="1.6" />
                  <rect x="13.3" y="13.3" width="7.2" height="7.2" rx="1.6" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                aria-label="List view"
                className={`w-[38px] h-[38px] rounded-[10px] bg-white border grid place-items-center transition shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${
                  viewMode === "list"
                    ? "text-[#2563eb] border-[#c5d6f8]"
                    : "text-[#94a3b8] border-[#e2e8f0] hover:text-[#475569]"
                }`}
              >
                <svg
                  className="w-[17px] h-[17px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                >
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Trips Container */}
        {viewMode === "grid" ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-[21px]">
            {filteredAndSortedTrips.map((trip) => (
              <article
                key={trip.id}
                onClick={() => router.push(`/trips/${trip.id}`)}
                className="relative bg-white border border-[#e9eef5] rounded-[14px] shadow-[0_1px_2px_rgba(16,24,40,0.05)] hover:-translate-y-[3px] hover:shadow-[0_12px_26px_rgba(23,37,84,0.10)] transition-all duration-200 flex flex-col justify-between cursor-pointer"
              >
                <div className="relative h-[152px]">
                  <img
                    src={trip.heroImage || trip.image}
                    alt={trip.name}
                    className="w-full h-full object-cover rounded-t-[13px]"
                  />
                  {/* Status Badge */}
                  <span
                    className={`absolute top-3 left-3 inline-flex items-center gap-[7px] py-1 pr-3 pl-[5px] rounded-full text-white text-[12.5px] font-semibold tracking-[0.1px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] ${
                      trip.status === "upcoming"
                        ? "bg-[#22c55e]"
                        : "bg-[rgba(71,85,105,0.75)] backdrop-blur-[4px]"
                    }`}
                  >
                    <span className="w-[17px] h-[17px] rounded-full bg-white grid place-items-center shrink-0">
                      <svg
                        className={`w-[9px] h-[9px] ${
                          trip.status === "upcoming" ? "text-[#16a34a]" : "text-[#475569]"
                        }`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    {trip.status === "upcoming" ? "Upcoming" : "Completed"}
                  </span>

                  {/* 3 Dots Menu */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveActionMenuId(
                        activeActionMenuId === trip.id ? null : trip.id
                      );
                    }}
                    className="absolute top-3 right-3 w-[30px] h-[30px] rounded-[9px] bg-[rgba(15,23,42,0.32)] backdrop-blur-[5px] text-white grid place-items-center hover:bg-[rgba(15,23,42,0.55)] transition"
                    aria-label="Trip options"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="1.9" />
                      <circle cx="12" cy="12" r="1.9" />
                      <circle cx="12" cy="19" r="1.9" />
                    </svg>
                  </button>

                  {activeActionMenuId === trip.id && (
                    <div
                      className="absolute top-[47px] right-3 bg-white border border-[#e6ecf4] rounded-[10px] shadow-[0_10px_28px_rgba(15,23,42,0.18)] p-1.5 min-w-[152px] z-40"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          closeAllMenus();
                          setDetailTrip(trip);
                        }}
                        className="flex items-center gap-2 w-full p-2 rounded-[8px] text-[13px] font-medium text-[#334155] hover:bg-[#f1f5f9] text-left"
                      >
                        View details
                      </button>
                      <button
                        onClick={() => {
                          closeAllMenus();
                          openEditForm(trip);
                        }}
                        className="flex items-center gap-2 w-full p-2 rounded-[8px] text-[13px] font-medium text-[#334155] hover:bg-[#f1f5f9] text-left"
                      >
                        Edit trip
                      </button>
                      <button
                        onClick={() => {
                          closeAllMenus();
                          handleDeleteTrip(trip.id);
                        }}
                        className="flex items-center gap-2 w-full p-2 rounded-[8px] text-[13px] font-medium text-[#dc2626] hover:bg-[#f1f5f9] text-left"
                      >
                        Delete trip
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-[16px_18px_18px] flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[19px] font-bold text-[#172554] mb-[11px] tracking-[-0.2px]">
                      {trip.name}
                    </h3>
                    <div className="flex items-center flex-wrap gap-x-[9px] gap-y-[5px] text-[13.5px] text-[#64748b]">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        <svg
                          className="w-[15px] h-[15px] text-[#94a3b8] shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="4" width="18" height="17" rx="2.5" />
                          <line x1="16" y1="2.5" x2="16" y2="6.5" />
                          <line x1="8" y1="2.5" x2="8" y2="6.5" />
                          <line x1="3" y1="9.5" x2="21" y2="9.5" />
                        </svg>
                        {formatDate(trip.startDate)}
                      </span>
                      <svg
                        className="w-[13px] h-[13px] text-[#94a3b8] shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="4" y1="12" x2="19" y2="12" />
                        <polyline points="13 6 19 12 13 18" />
                      </svg>
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        {formatDate(trip.endDate)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap ml-[9px]">
                        <svg
                          className="w-[15px] h-[15px] text-[#94a3b8] shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                          <circle cx="12" cy="10" r="2.8" />
                        </svg>
                        {trip.days} Days
                      </span>
                    </div>
                  </div>

                  <div className="flex items-end gap-3.5 mt-[13px]">
                    <p className="flex-1 text-[14px] leading-[1.5] text-[#64748b]">
                      {trip.description}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/trips/${trip.id}`);
                      }}
                      className="w-[38px] h-[38px] shrink-0 rounded-full bg-[#e8f0fe] text-[#2563eb] grid place-items-center hover:bg-[#2563eb] hover:text-white transition"
                      aria-label={`Open ${trip.name} trip`}
                    >
                      <svg
                        className="w-[17px] h-[17px]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="4" y1="12" x2="19" y2="12" />
                        <polyline points="13 6 19 12 13 18" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {/* Add New Trip Card */}
            <div
              onClick={openAddForm}
              className="border-[1.6px] border-dashed border-[#a9c3f2] rounded-[14px] flex flex-col items-center justify-center text-center p-[34px_30px] min-h-[322px] cursor-pointer hover:bg-[rgba(255,255,255,0.75)] hover:border-[#2563eb] transition group"
            >
              <span className="w-[52px] h-[52px] rounded-full bg-[#2563eb] text-white grid place-items-center shadow-[0_8px_18px_rgba(37,99,235,0.35)] group-hover:scale-105 transition">
                <svg
                  className="w-[22px] h-[22px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </span>
              <h3 className="text-[19px] font-bold text-[#172554] mt-[18px] tracking-[-0.2px]">
                Add New Trip
              </h3>
              <p className="text-[14px] text-[#64748b] leading-[1.55] mt-2 max-w-[295px]">
                Start planning your next adventure and create unforgettable memories.
              </p>
            </div>
          </section>
        ) : (
          /* List View */
          <section className="flex flex-col gap-3.5">
            {filteredAndSortedTrips.map((trip) => (
              <article
                key={trip.id}
                onClick={() => router.push(`/trips/${trip.id}`)}
                className="relative bg-white border border-[#e9eef5] rounded-[14px] shadow-[0_1px_2px_rgba(16,24,40,0.05)] hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(23,37,84,0.10)] transition-all duration-200 grid grid-cols-1 md:grid-cols-[265px_1fr] cursor-pointer"
              >
                <div className="relative h-[152px] md:h-full md:min-h-[158px]">
                  <img
                    src={trip.heroImage || trip.image}
                    alt={trip.name}
                    className="w-full h-full object-cover rounded-t-[13px] md:rounded-t-none md:rounded-l-[13px]"
                  />
                  <span
                    className={`absolute top-3 left-3 inline-flex items-center gap-[7px] py-1 pr-3 pl-[5px] rounded-full text-white text-[12.5px] font-semibold tracking-[0.1px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] ${
                      trip.status === "upcoming"
                        ? "bg-[#22c55e]"
                        : "bg-[rgba(71,85,105,0.75)] backdrop-blur-[4px]"
                    }`}
                  >
                    <span className="w-[17px] h-[17px] rounded-full bg-white grid place-items-center shrink-0">
                      <svg
                        className={`w-[9px] h-[9px] ${
                          trip.status === "upcoming" ? "text-[#16a34a]" : "text-[#475569]"
                        }`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    {trip.status === "upcoming" ? "Upcoming" : "Completed"}
                  </span>
                </div>

                <div className="p-4 md:p-[18px_22px] flex flex-col justify-center">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-[19px] font-bold text-[#172554] mb-2 tracking-[-0.2px]">
                        {trip.name}
                      </h3>
                      <div className="flex items-center flex-wrap gap-x-[9px] gap-y-[5px] text-[13.5px] text-[#64748b]">
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                          {formatDate(trip.startDate)}
                        </span>
                        <svg
                          className="w-[13px] h-[13px] text-[#94a3b8]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        >
                          <line x1="4" y1="12" x2="19" y2="12" />
                          <polyline points="13 6 19 12 13 18" />
                        </svg>
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                          {formatDate(trip.endDate)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap ml-2">
                          {trip.days} Days
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditForm(trip)}
                        className="px-2.5 py-1 text-xs border border-[#dfe6ee] rounded-md hover:bg-[#f1f5f9]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTrip(trip.id)}
                        className="px-2.5 py-1 text-xs border border-red-200 text-red-600 rounded-md hover:bg-red-50"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDetailTrip(trip)}
                        className="w-[34px] h-[34px] rounded-full bg-[#e8f0fe] text-[#2563eb] grid place-items-center hover:bg-[#2563eb] hover:text-white transition"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                        >
                          <line x1="4" y1="12" x2="19" y2="12" />
                          <polyline points="13 6 19 12 13 18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-[14px] leading-[1.5] text-[#64748b] mt-3">
                    {trip.description}
                  </p>
                </div>
              </article>
            ))}

            <div
              onClick={openAddForm}
              className="border-[1.6px] border-dashed border-[#a9c3f2] rounded-[14px] flex items-center gap-5 p-[24px_28px] cursor-pointer hover:bg-[rgba(255,255,255,0.75)] hover:border-[#2563eb] transition group"
            >
              <span className="w-[44px] h-[44px] rounded-full bg-[#2563eb] text-white grid place-items-center shadow-[0_8px_18px_rgba(37,99,235,0.35)] group-hover:scale-105 transition shrink-0">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </span>
              <div>
                <h3 className="text-[17px] font-bold text-[#172554] tracking-[-0.2px]">
                  Add New Trip
                </h3>
                <p className="text-[14px] text-[#64748b] mt-1">
                  Start planning your next adventure and create unforgettable memories.
                </p>
              </div>
            </div>
          </section>
        )}

        {filteredAndSortedTrips.length === 0 && (
          <div className="text-center py-[52px] px-5 text-[#64748b] text-[15px] bg-white border border-dashed border-[#d7e0ec] rounded-[14px] mt-4">
            No trips found matching your search.
          </div>
        )}
      </main>

      {/* ============ ADD / EDIT TRIP MODAL ============ */}
      {formOpen && (
        <div
          className="fixed inset-0 bg-[rgba(15,23,42,0.55)] backdrop-blur-[2px] grid place-items-center z-50 p-5"
          onClick={() => setFormOpen(false)}
        >
          <div
            className="bg-white rounded-[16px] w-full max-w-[520px] max-h-[92vh] overflow-auto shadow-[0_24px_64px_rgba(2,8,23,0.35)] animate-[pop_0.2s_ease]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-[19px_24px] border-b border-[#eef2f7]">
              <h3 className="text-[17.5px] font-bold text-[#172554]">
                {editingTrip ? "Edit Trip" : "Add New Trip"}
              </h3>
              <button
                onClick={() => setFormOpen(false)}
                className="w-8 h-8 rounded-[8px] grid place-items-center text-[#64748b] hover:bg-[#f1f5f9] transition"
              >
                <svg
                  className="w-[17px] h-[17px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="p-[22px_24px_6px]">
                <div className="mb-4">
                  <label className="block text-[13px] font-semibold text-[#334155] mb-1.5">
                    Destination
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paris"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full p-[10px_12px] border border-[#dfe6ee] rounded-[9px] text-[14px] text-[#1e293b] outline-none focus:border-[#2563eb] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.13)] transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5 mb-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#334155] mb-1.5">
                      Start date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="w-full p-[10px_12px] border border-[#dfe6ee] rounded-[9px] text-[14px] text-[#1e293b] outline-none focus:border-[#2563eb] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.13)] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#334155] mb-1.5">
                      End date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="w-full p-[10px_12px] border border-[#dfe6ee] rounded-[9px] text-[14px] text-[#1e293b] outline-none focus:border-[#2563eb] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.13)] transition"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-[13px] font-semibold text-[#334155] mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "upcoming" | "completed",
                      })
                    }
                    className="w-full p-[10px_12px] border border-[#dfe6ee] rounded-[9px] text-[14px] text-[#1e293b] outline-none focus:border-[#2563eb] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.13)] transition"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[13px] font-semibold text-[#334155]">
                      Cover Image <span className="font-normal text-[#94a3b8]">(optional)</span>
                    </label>
                    <div className="flex bg-[#f1f5f9] p-0.5 rounded-[8px] text-[12px] font-medium border border-[#e2e8f0]">
                      <button
                        type="button"
                        onClick={() => setImageInputMode("upload")}
                        className={`px-3 py-1 rounded-[6px] transition ${
                          imageInputMode === "upload"
                            ? "bg-white text-[#2563eb] shadow-sm font-semibold"
                            : "text-[#64748b] hover:text-[#1e293b]"
                        }`}
                      >
                        Upload from Device
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMode("url")}
                        className={`px-3 py-1 rounded-[6px] transition ${
                          imageInputMode === "url"
                            ? "bg-white text-[#2563eb] shadow-sm font-semibold"
                            : "text-[#64748b] hover:text-[#1e293b]"
                        }`}
                      >
                        Image URL
                      </button>
                    </div>
                  </div>

                  {imageInputMode === "upload" ? (
                    <div>
                      <input
                        ref={tripImageFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleTripImageFile(file);
                          e.target.value = "";
                        }}
                      />
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setTripImageDragActive(true);
                        }}
                        onDragLeave={() => setTripImageDragActive(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setTripImageDragActive(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleTripImageFile(file);
                        }}
                        onClick={() => tripImageFileInputRef.current?.click()}
                        className={`w-full py-4 px-4 border-2 border-dashed rounded-[10px] flex flex-col items-center justify-center text-center cursor-pointer transition ${
                          tripImageDragActive
                            ? "border-[#2563eb] bg-[#eff6ff]"
                            : "border-[#dfe6ee] bg-[#f8fafc] hover:border-[#2563eb] hover:bg-[#f0f7ff]"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-[#eff6ff] text-[#2563eb] grid place-items-center mb-1">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </div>
                        <span className="text-[13px] font-semibold text-[#1e293b]">
                          Click to browse device or drag & drop image
                        </span>
                        <span className="text-[11.5px] text-[#64748b] mt-0.5">
                          PNG, JPG, WebP · automatically optimized
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        placeholder="Paste image link (e.g. Unsplash, Pexels, or hosted URL)"
                        value={formData.image}
                        onChange={(e) =>
                          setFormData({ ...formData, image: e.target.value })
                        }
                        className="w-full p-[10px_12px] border border-[#dfe6ee] rounded-[9px] text-[14px] text-[#1e293b] outline-none focus:border-[#2563eb] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.13)] transition"
                      />
                    </div>
                  )}

                  {/* Thumbnail Preview */}
                  {formData.image && (
                    <div className="relative mt-2.5 rounded-[10px] overflow-hidden border border-[#dfe6ee] h-28 bg-[#f8fafc] group">
                      <img
                        src={formData.image}
                        alt="Trip Cover Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-[2px] text-white text-[11px] font-semibold">
                        Preview
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({ ...formData, image: "" });
                        }}
                        className="absolute top-2 right-2 bg-red-600/85 hover:bg-red-600 text-white rounded-full p-1 transition shadow-sm"
                        title="Remove image"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-[13px] font-semibold text-[#334155] mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="What's the plan?"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full p-[10px_12px] border border-[#dfe6ee] rounded-[9px] text-[14px] text-[#1e293b] outline-none focus:border-[#2563eb] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.13)] transition resize-y"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 p-[14px_24px_22px]">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-[19px] py-2.5 rounded-[9px] text-[14px] font-semibold border border-[#dbe3ec] bg-white text-[#334155] hover:bg-[#f5f8fb] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-[19px] py-2.5 rounded-[9px] text-[14px] font-semibold bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition"
                >
                  {editingTrip ? "Save Changes" : "Add Trip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ TRIP DETAILS MODAL ============ */}
      {detailTrip && (
        <div
          className="fixed inset-0 bg-[rgba(15,23,42,0.55)] backdrop-blur-[2px] grid place-items-center z-50 p-5"
          onClick={() => setDetailTrip(null)}
        >
          <div
            className="bg-white rounded-[16px] w-full max-w-[560px] overflow-hidden shadow-[0_24px_64px_rgba(2,8,23,0.35)] animate-[pop_0.2s_ease]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[215px]">
              <img
                src={detailTrip.heroImage || detailTrip.image}
                alt={detailTrip.name}
                className="w-full h-full object-cover"
              />
              <span
                className={`absolute top-3 left-3 inline-flex items-center gap-[7px] py-1 pr-3 pl-[5px] rounded-full text-white text-[12.5px] font-semibold tracking-[0.1px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] ${
                  detailTrip.status === "upcoming"
                    ? "bg-[#22c55e]"
                    : "bg-[rgba(71,85,105,0.75)] backdrop-blur-[4px]"
                }`}
              >
                <span className="w-[17px] h-[17px] rounded-full bg-white grid place-items-center shrink-0">
                  <svg
                    className={`w-[9px] h-[9px] ${
                      detailTrip.status === "upcoming"
                        ? "text-[#16a34a]"
                        : "text-[#475569]"
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                {detailTrip.status === "upcoming" ? "Upcoming" : "Completed"}
              </span>
            </div>

            <div className="p-[20px_24px_24px]">
              <h3 className="text-[21px] font-extrabold text-[#172554] tracking-[-0.2px]">
                {detailTrip.name}
              </h3>
              <div className="flex items-center flex-wrap gap-x-[9px] gap-y-[5px] text-[14px] text-[#64748b] mt-2.5">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <svg
                    className="w-[15px] h-[15px] text-[#94a3b8] shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="17" rx="2.5" />
                    <line x1="16" y1="2.5" x2="16" y2="6.5" />
                    <line x1="8" y1="2.5" x2="8" y2="6.5" />
                    <line x1="3" y1="9.5" x2="21" y2="9.5" />
                  </svg>
                  {formatDate(detailTrip.startDate)}
                </span>
                <svg
                  className="w-[13px] h-[13px] text-[#94a3b8] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" y1="12" x2="19" y2="12" />
                  <polyline points="13 6 19 12 13 18" />
                </svg>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  {formatDate(detailTrip.endDate)}
                </span>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap ml-[9px]">
                  <svg
                    className="w-[15px] h-[15px] text-[#94a3b8] shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                    <circle cx="12" cy="10" r="2.8" />
                  </svg>
                  {detailTrip.days} Days
                </span>
              </div>

              <p className="mt-3.5 text-[14px] leading-[1.65] text-[#64748b]">
                {detailTrip.description}
              </p>

              <div className="flex justify-end gap-2.5 mt-5">
                <button
                  onClick={() => setDetailTrip(null)}
                  className="px-[19px] py-2.5 rounded-[9px] text-[14px] font-semibold border border-[#dbe3ec] bg-white text-[#334155] hover:bg-[#f5f8fb] transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const targetId = detailTrip.id;
                    setDetailTrip(null);
                    router.push(`/trips/${targetId}`);
                  }}
                  className="px-[19px] py-2.5 rounded-[9px] text-[14px] font-semibold bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition"
                >
                  View Itinerary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ TOAST ============ */}
      <div
        className={`fixed bottom-[26px] left-1/2 -translate-x-1/2 bg-[#0f172a] text-white px-[19px] py-[11px] rounded-[10px] text-[13.5px] font-medium shadow-[0_12px_30px_rgba(2,8,23,0.35)] z-[200] max-w-[88vw] text-center transition-all duration-200 pointer-events-none ${
          toastMsg ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        role="status"
      >
        {toastMsg}
      </div>
    </div>
  );
}
