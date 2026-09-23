"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { TripData, EventItem, TripDocument, getStoredTrips, saveStoredTrips } from "@/lib/tripsData";
import RichTextEditor from "@/components/RichTextEditor";

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trips, setTrips] = useState<TripData[]>([]);
  const [currentTrip, setCurrentTrip] = useState<TripData | null>(null);
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  // Top banner dropdown & modal
  const [isBannerMenuOpen, setIsBannerMenuOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerInputUrl, setBannerInputUrl] = useState("");
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // Add Event Modal state
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    startTime: "09:00",
    endTime: "15:00",
    calculatedDuration: "~ 6 hrs",
    location: "",
    description: "",
    notes: "",
    coverImage: "",
    photos: [] as string[],
  });

  const [newPhotoInputUrl, setNewPhotoInputUrl] = useState("");
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const photosFileInputRef = useRef<HTMLInputElement>(null);

  // Information and documents modal state
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [activeDocMenuId, setActiveDocMenuId] = useState<string | null>(null);
  const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false);
  const [newDocData, setNewDocData] = useState({
    title: "",
    type: "passport" as TripDocument["type"],
    description: "",
    fileName: "",
    fileSize: "1.5 MB",
    colorScheme: "blue" as TripDocument["colorScheme"],
    fileUrl: "",
    eventId: "" as string,
  });
  const docFileInputRef = useRef<HTMLInputElement>(null);

  // Arrange, Delete, Edit Event States
  const [deleteEventConfirmId, setDeleteEventConfirmId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Edit Event Modal State
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [editEventData, setEditEventData] = useState({
    id: "",
    title: "",
    date: "",
    startTime: "09:00",
    endTime: "15:00",
    calculatedDuration: "~ 4 hrs",
    location: "",
    description: "",
    notes: "",
    coverImage: "",
    photos: [] as string[],
  });
  const [editPhotoInputUrl, setEditPhotoInputUrl] = useState("");
  const editCoverFileInputRef = useRef<HTMLInputElement>(null);
  const editPhotosFileInputRef = useRef<HTMLInputElement>(null);

  // Add Photo to specific Card Modal State
  const [cardPhotoModalEventId, setCardPhotoModalEventId] = useState<string | null>(null);
  const [cardPhotoUrlInput, setCardPhotoUrlInput] = useState("");
  const cardPhotoFileInputRef = useRef<HTMLInputElement>(null);

  // In-card direct edit states
  const [editingDescId, setEditingDescId] = useState<string | null>(null);
  const [editingDescText, setEditingDescText] = useState("");
  const [inlineNoteInputs, setInlineNoteInputs] = useState<Record<string, string>>({});
  const [inlineNoteOpen, setInlineNoteOpen] = useState<Record<string, boolean>>({});

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg((cur) => (cur === msg ? null : cur)), 2500);
  };

  useEffect(() => {
    const loaded = getStoredTrips();
    setTrips(loaded);
    const found = loaded.find((t) => t.id === tripId) || loaded[0];
    if (found) {
      setCurrentTrip(found);
      const initialExpanded: Record<string, boolean> = {};
      const day3 = found.events.find((e) => e.dayNumber === 3);
      if (day3) {
        initialExpanded[day3.id] = true;
      } else if (found.events.length > 0) {
        initialExpanded[found.events[0].id] = true;
      }
      setExpandedEvents(initialExpanded);

      setNewEvent((prev) => ({
        ...prev,
        title: `Day ${(found.events[found.events.length - 1]?.dayNumber || 0) + 1} – `,
        date: found.endDate,
      }));
    }
  }, [tripId]);

  // Node.js engine duration calculation via API
  const calculateDurationWithNode = async (start: string, end: string) => {
    if (!start || !end) return;
    try {
      const res = await fetch("/api/duration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime: start, endTime: end }),
      });
      const data = await res.json();
      if (data.duration) {
        setNewEvent((prev) => ({ ...prev, calculatedDuration: data.duration }));
      }
    } catch {
      // client-side fallback
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);
      let diff = eh * 60 + em - (sh * 60 + sm);
      if (diff < 0) diff += 24 * 60;
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      const dur = h > 0 ? (m > 0 ? `~ ${h} hrs ${m} mins` : `~ ${h} hrs`) : `~ ${m} mins`;
      setNewEvent((prev) => ({ ...prev, calculatedDuration: dur }));
    }
  };

  const handleTimeChange = (type: "start" | "end", val: string) => {
    if (type === "start") {
      setNewEvent((prev) => ({ ...prev, startTime: val }));
      calculateDurationWithNode(val, newEvent.endTime);
    } else {
      setNewEvent((prev) => ({ ...prev, endTime: val }));
      calculateDurationWithNode(newEvent.startTime, val);
    }
  };

  const toggleEvent = (id: string) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const allExpanded = useMemo(() => {
    if (!currentTrip || currentTrip.events.length === 0) return false;
    return currentTrip.events.every((e) => expandedEvents[e.id]);
  }, [currentTrip, expandedEvents]);

  const toggleExpandAll = () => {
    if (!currentTrip) return;
    if (allExpanded) {
      setExpandedEvents({});
    } else {
      const all: Record<string, boolean> = {};
      currentTrip.events.forEach((e) => {
        all[e.id] = true;
      });
      setExpandedEvents(all);
    }
  };

  // Banner image upload from local file
  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentTrip) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      updateBannerImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const updateBannerImage = (imageUrl: string) => {
    if (!currentTrip || !imageUrl) return;
    const updatedTrip: TripData = {
      ...currentTrip,
      heroImage: imageUrl,
      image: imageUrl,
    };
    const updatedList = trips.map((t) => (t.id === currentTrip.id ? updatedTrip : t));
    setTrips(updatedList);
    setCurrentTrip(updatedTrip);
    saveStoredTrips(updatedList);
    setIsBannerModalOpen(false);
    setIsBannerMenuOpen(false);
    setBannerInputUrl("");
    showToast("Banner image updated!");
  };

  // Event Cover Image upload from local file
  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setNewEvent((prev) => ({ ...prev, coverImage: dataUrl }));
      showToast("Cover image uploaded");
    };
    reader.readAsDataURL(file);
  };

  // Event Photos upload from local file(s)
  const handlePhotosFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setNewEvent((prev) => ({
          ...prev,
          photos: [...prev.photos, dataUrl],
        }));
      };
      reader.readAsDataURL(file);
    });
    showToast(`${files.length} photo(s) uploaded`);
  };

  const handleAddPhotoUrl = () => {
    if (!newPhotoInputUrl.trim()) return;
    setNewEvent((prev) => ({
      ...prev,
      photos: [...prev.photos, newPhotoInputUrl.trim()],
    }));
    setNewPhotoInputUrl("");
    showToast("Photo URL added");
  };

  const handleRemovePhoto = (idx: number) => {
    setNewEvent((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== idx),
    }));
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTrip || !newEvent.title || !newEvent.location) return;

    const parsedNotes = newEvent.notes
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);

    const fallbackImg =
      newEvent.coverImage.trim() ||
      newEvent.photos[0] ||
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80";

    const nextDayNumber =
      (currentTrip.events[currentTrip.events.length - 1]?.dayNumber || 0) + 1;

    const createdEvent: EventItem = {
      id: `e-${Date.now()}`,
      dayNumber: nextDayNumber,
      title: newEvent.title,
      date: newEvent.date || currentTrip.startDate,
      duration: newEvent.calculatedDuration || "~ 4 hrs",
      location: newEvent.location,
      description:
        newEvent.description ||
        "Explore landmarks, sample regional culinary specialties, and create memories.",
      coverImage: fallbackImg,
      photos: newEvent.photos.length > 0 ? newEvent.photos : [fallbackImg],
      notes:
        parsedNotes.length > 0
          ? parsedNotes
          : ["Check local entry guidelines", "Wear comfortable shoes"],
    };

    const updatedEvents = [...currentTrip.events, createdEvent];
    const updatedTrip: TripData = {
      ...currentTrip,
      events: updatedEvents,
    };

    const updatedAllTrips = trips.map((t) =>
      t.id === currentTrip.id ? updatedTrip : t
    );

    setTrips(updatedAllTrips);
    setCurrentTrip(updatedTrip);
    saveStoredTrips(updatedAllTrips);

    setExpandedEvents((prev) => ({ ...prev, [createdEvent.id]: true }));
    setIsAddEventOpen(false);
    showToast("New event added to itinerary!");

    // Reset form
    const nextDay = nextDayNumber + 1;
    setNewEvent({
      title: `Day ${nextDay} – `,
      date: currentTrip.endDate,
      startTime: "09:00",
      endTime: "15:00",
      calculatedDuration: "~ 6 hrs",
      location: "",
      description: "",
      notes: "",
      coverImage: "",
      photos: [],
    });
  };

  // Event Helper: update trip events in state & localStorage
  const updateTripEvents = (updatedEvents: EventItem[]) => {
    if (!currentTrip) return;
    const updatedTrip: TripData = {
      ...currentTrip,
      events: updatedEvents,
    };
    const updatedAllTrips = trips.map((t) =>
      t.id === currentTrip.id ? updatedTrip : t
    );
    setTrips(updatedAllTrips);
    setCurrentTrip(updatedTrip);
    saveStoredTrips(updatedAllTrips);
  };

  // Event Arrangement via Drag and Drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || !currentTrip) return;
    if (draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const items = [...currentTrip.events];
    const [draggedItem] = items.splice(draggedIndex, 1);
    items.splice(targetIndex, 0, draggedItem);

    const reindexed = items.map((evt, idx) => ({
      ...evt,
      dayNumber: idx + 1,
    }));

    updateTripEvents(reindexed);
    setDraggedIndex(null);
    setDragOverIndex(null);
    showToast("Event card reordered");
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Event Deletion
  const handleDeleteEvent = (eventId: string) => {
    if (!currentTrip) return;
    const newEvents = currentTrip.events.filter((ev) => ev.id !== eventId);
    const reindexed = newEvents.map((evt, idx) => ({
      ...evt,
      dayNumber: idx + 1,
    }));
    updateTripEvents(reindexed);
    setDeleteEventConfirmId(null);
    showToast("Event deleted from itinerary");
  };

  // Event Editing
  const handleOpenEditEvent = (evt: EventItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditEventData({
      id: evt.id,
      title: evt.title,
      date: evt.date,
      startTime: "09:00",
      endTime: "15:00",
      calculatedDuration: evt.duration || "~ 4 hrs",
      location: evt.location,
      description: evt.description,
      notes: (evt.notes || []).join("\n"),
      coverImage: evt.coverImage || "",
      photos: [...(evt.photos || [])],
    });
    setEditPhotoInputUrl("");
    setIsEditEventOpen(true);
  };

  const calculateEditDurationWithNode = async (start: string, end: string) => {
    if (!start || !end) return;
    try {
      const res = await fetch("/api/duration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime: start, endTime: end }),
      });
      const data = await res.json();
      if (data.duration) {
        setEditEventData((prev) => ({ ...prev, calculatedDuration: data.duration }));
      }
    } catch {
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);
      let diff = eh * 60 + em - (sh * 60 + sm);
      if (diff < 0) diff += 24 * 60;
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      const dur = h > 0 ? (m > 0 ? `~ ${h} hrs ${m} mins` : `~ ${h} hrs`) : `~ ${m} mins`;
      setEditEventData((prev) => ({ ...prev, calculatedDuration: dur }));
    }
  };

  const handleEditTimeChange = (type: "start" | "end", val: string) => {
    if (type === "start") {
      setEditEventData((prev) => ({ ...prev, startTime: val }));
      calculateEditDurationWithNode(val, editEventData.endTime);
    } else {
      setEditEventData((prev) => ({ ...prev, endTime: val }));
      calculateEditDurationWithNode(editEventData.startTime, val);
    }
  };

  const handleEditCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setEditEventData((prev) => ({ ...prev, coverImage: dataUrl }));
      showToast("Cover image updated");
    };
    reader.readAsDataURL(file);
  };

  const handleEditPhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setEditEventData((prev) => ({
          ...prev,
          photos: [...prev.photos, dataUrl],
        }));
      };
      reader.readAsDataURL(file);
    });
    showToast(`${files.length} photo(s) added`);
  };

  const handleAddEditPhotoUrl = () => {
    if (!editPhotoInputUrl.trim()) return;
    setEditEventData((prev) => ({
      ...prev,
      photos: [...prev.photos, editPhotoInputUrl.trim()],
    }));
    setEditPhotoInputUrl("");
    showToast("Photo URL added");
  };

  const handleRemoveEditPhoto = (idx: number) => {
    setEditEventData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== idx),
    }));
  };

  const handleSaveEditEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTrip || !editEventData.id || !editEventData.title || !editEventData.location) return;

    const parsedNotes = editEventData.notes
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);

    const fallbackImg =
      editEventData.coverImage.trim() ||
      editEventData.photos[0] ||
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80";

    const updatedEvents = currentTrip.events.map((evt) => {
      if (evt.id !== editEventData.id) return evt;
      return {
        ...evt,
        title: editEventData.title,
        date: editEventData.date || evt.date,
        duration: editEventData.calculatedDuration || evt.duration,
        location: editEventData.location,
        description: editEventData.description,
        notes: parsedNotes.length > 0 ? parsedNotes : evt.notes,
        coverImage: fallbackImg,
        photos: editEventData.photos.length > 0 ? editEventData.photos : [fallbackImg],
      };
    });

    updateTripEvents(updatedEvents);
    setIsEditEventOpen(false);
    showToast("Event updated successfully!");
  };

  // Image Management on Card: Delete photo
  const handleDeletePhoto = (eventId: string, photoIdx: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentTrip) return;
    const updatedEvents = currentTrip.events.map((evt) => {
      if (evt.id !== eventId) return evt;
      const currentPhotos = evt.photos && evt.photos.length > 0 ? evt.photos : [evt.coverImage];
      const newPhotos = currentPhotos.filter((_, idx) => idx !== photoIdx);
      const newCover =
        newPhotos.length > 0
          ? (evt.coverImage === currentPhotos[photoIdx] ? newPhotos[0] : evt.coverImage)
          : "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80";
      return {
        ...evt,
        photos: newPhotos,
        coverImage: newCover,
      };
    });
    updateTripEvents(updatedEvents);
    showToast("Photo deleted");
  };

  // Image Management on Card: Add photo
  const handleAddPhotoToEvent = (eventId: string, photoUrl: string) => {
    if (!currentTrip || !photoUrl.trim()) return;
    const updatedEvents = currentTrip.events.map((evt) => {
      if (evt.id !== eventId) return evt;
      const currentPhotos = evt.photos || [];
      return {
        ...evt,
        photos: [...currentPhotos, photoUrl.trim()],
        coverImage: evt.coverImage || photoUrl.trim(),
      };
    });
    updateTripEvents(updatedEvents);
    setCardPhotoModalEventId(null);
    setCardPhotoUrlInput("");
    showToast("Photo added to event");
  };

  const handleCardPhotoFileUpload = (eventId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        handleAddPhotoToEvent(eventId, dataUrl);
      };
      reader.readAsDataURL(file);
    });
  };

  // Notes Management on Card
  const handleDeleteNote = (eventId: string, noteIdx: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentTrip) return;
    const updatedEvents = currentTrip.events.map((evt) => {
      if (evt.id !== eventId) return evt;
      return {
        ...evt,
        notes: evt.notes.filter((_, idx) => idx !== noteIdx),
      };
    });
    updateTripEvents(updatedEvents);
    showToast("Note removed");
  };

  const handleAddInlineNote = (eventId: string) => {
    const text = (inlineNoteInputs[eventId] || "").trim();
    if (!text || !currentTrip) return;
    const updatedEvents = currentTrip.events.map((evt) => {
      if (evt.id !== eventId) return evt;
      return {
        ...evt,
        notes: [...(evt.notes || []), text],
      };
    });
    updateTripEvents(updatedEvents);
    setInlineNoteInputs((prev) => ({ ...prev, [eventId]: "" }));
    setInlineNoteOpen((prev) => ({ ...prev, [eventId]: false }));
    showToast("Note added");
  };

  // Description Quick-Edit on Card
  const handleStartEditDesc = (eventId: string, currentDesc: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingDescId(eventId);
    setEditingDescText(currentDesc);
  };

  const handleSaveDesc = (eventId: string) => {
    if (!currentTrip) return;
    const updatedEvents = currentTrip.events.map((evt) => {
      if (evt.id !== eventId) return evt;
      return {
        ...evt,
        description: editingDescText,
      };
    });
    updateTripEvents(updatedEvents);
    setEditingDescId(null);
    showToast("Description saved");
  };

  // Document Management Handlers
  const handleDocFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      setNewDocData((prev) => ({
        ...prev,
        fileName: file.name,
        fileSize: sizeStr,
        fileUrl: dataUrl,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
      }));
      showToast(`Selected file: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handleAddDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTrip || !newDocData.title) return;

    const newDoc: TripDocument = {
      id: `doc-${Date.now()}`,
      title: newDocData.title,
      type: newDocData.type,
      description: newDocData.description || `Uploaded document for ${currentTrip.name}`,
      fileName: newDocData.fileName || `${newDocData.title.toLowerCase().replace(/\s+/g, "-")}.pdf`,
      fileSize: newDocData.fileSize || "1.2 MB",
      fileUrl: newDocData.fileUrl || "",
      colorScheme: newDocData.colorScheme,
      eventId: newDocData.eventId.trim() ? newDocData.eventId.trim() : undefined,
    };

    const existingDocs = currentTrip.documents || [];
    const updatedTrip: TripData = {
      ...currentTrip,
      documents: [...existingDocs, newDoc],
    };

    const updatedList = trips.map((t) => (t.id === currentTrip.id ? updatedTrip : t));
    setTrips(updatedList);
    setCurrentTrip(updatedTrip);
    saveStoredTrips(updatedList);

    setIsAddDocModalOpen(false);
    setNewDocData({
      title: "",
      type: "passport",
      description: "",
      fileName: "",
      fileSize: "1.5 MB",
      colorScheme: "blue",
      fileUrl: "",
      eventId: "",
    });
    showToast("Document added successfully!");
  };

  const handleOpenAddDocForEvent = (eventId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNewDocData({
      title: "",
      type: "passport",
      description: "",
      fileName: "",
      fileSize: "1.5 MB",
      colorScheme: "blue",
      fileUrl: "",
      eventId: eventId,
    });
    setIsAddDocModalOpen(true);
  };

  const handleOpenAddDocGeneral = () => {
    setNewDocData({
      title: "",
      type: "passport",
      description: "",
      fileName: "",
      fileSize: "1.5 MB",
      colorScheme: "blue",
      fileUrl: "",
      eventId: "",
    });
    setIsAddDocModalOpen(true);
  };

  const handleUnassignDoc = (docId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentTrip) return;
    const updatedDocs = (currentTrip.documents || []).map((d) => {
      if (d.id !== docId) return d;
      const copy = { ...d };
      delete copy.eventId;
      return copy;
    });
    const updatedTrip: TripData = {
      ...currentTrip,
      documents: updatedDocs,
    };
    const updatedList = trips.map((t) => (t.id === currentTrip.id ? updatedTrip : t));
    setTrips(updatedList);
    setCurrentTrip(updatedTrip);
    saveStoredTrips(updatedList);
    showToast("Document unassigned from event");
  };

  const handleDeleteDoc = (docId: string) => {
    if (!currentTrip) return;
    const filteredDocs = (currentTrip.documents || []).filter((d) => d.id !== docId);
    const updatedTrip: TripData = {
      ...currentTrip,
      documents: filteredDocs,
    };
    const updatedList = trips.map((t) => (t.id === currentTrip.id ? updatedTrip : t));
    setTrips(updatedList);
    setCurrentTrip(updatedTrip);
    saveStoredTrips(updatedList);
    setActiveDocMenuId(null);
    showToast("Document removed");
  };

  if (!currentTrip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef2f7] text-[#64748b]">
        Loading trip details...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full bg-[#eef2f7] text-[#334155] pb-24"
      onClick={() => setIsBannerMenuOpen(false)}
    >
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16 pt-5">
        {/* ================= HERO HEADER CARD ================= */}
        <section className="relative w-full h-[360px] sm:h-[400px] md:h-[440px] xl:h-[480px] rounded-[24px] overflow-hidden shadow-[0_16px_36px_rgba(15,23,42,0.18)]">
          <img
            src={currentTrip.heroImage || currentTrip.image}
            alt={currentTrip.name}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,18,34,0.88)] via-[rgba(10,18,34,0.32)] to-[rgba(10,18,34,0.45)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,18,34,0.65)] via-transparent to-[rgba(10,18,34,0.4)]" />

          {/* Top Navigation Bar inside Hero */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md text-white text-[14px] font-medium transition"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              My Trips
            </Link>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md grid place-items-center text-white transition"
                aria-label="Save trip"
              >
                <svg
                  className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
                </svg>
              </button>

              {/* Three dots button to change top banner image */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setIsBannerMenuOpen(!isBannerMenuOpen)}
                  className="w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md grid place-items-center text-white transition"
                  aria-label="Trip actions"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.8" />
                    <circle cx="12" cy="12" r="1.8" />
                    <circle cx="12" cy="19" r="1.8" />
                  </svg>
                </button>

                {isBannerMenuOpen && (
                  <div className="absolute right-0 top-12 bg-white rounded-[12px] shadow-[0_12px_32px_rgba(15,23,42,0.25)] border border-[#e2e8f0] p-1.5 min-w-[210px] z-50">
                    <button
                      onClick={() => {
                        setIsBannerMenuOpen(false);
                        setIsBannerModalOpen(true);
                      }}
                      className="flex items-center gap-2.5 w-full p-2.5 rounded-[8px] text-[13.5px] font-semibold text-[#1e293b] hover:bg-[#f1f5f9] transition text-left"
                    >
                      <svg
                        className="w-4 h-4 text-[#2563eb]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      Change Banner Image
                    </button>
                    <button
                      onClick={() => {
                        bannerFileInputRef.current?.click();
                        setIsBannerMenuOpen(false);
                      }}
                      className="flex items-center gap-2.5 w-full p-2.5 rounded-[8px] text-[13.5px] font-semibold text-[#1e293b] hover:bg-[#f1f5f9] transition text-left"
                    >
                      <svg
                        className="w-4 h-4 text-[#2563eb]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      Upload Local Banner
                    </button>
                  </div>
                )}
                {/* Hidden banner file input */}
                <input
                  type="file"
                  ref={bannerFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerFileUpload}
                />
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="absolute left-6 md:left-10 bottom-8 md:bottom-10 right-6 md:right-12 z-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl">
              <span className="text-[12px] md:text-[13px] tracking-[0.25em] font-semibold text-white/80 uppercase mb-2 block">
                {currentTrip.tagline || "EXPLORE · DISCOVER · EXPERIENCE"}
              </span>
              <h1 className="text-[46px] md:text-[62px] font-extrabold text-white font-serif tracking-tight leading-[1.05] drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
                {currentTrip.name}
              </h1>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 text-white text-[14.5px] font-medium">
                <div className="inline-flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-white/90"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="17" rx="2.5" />
                    <line x1="16" y1="2.5" x2="16" y2="6.5" />
                    <line x1="8" y1="2.5" x2="8" y2="6.5" />
                    <line x1="3" y1="9.5" x2="21" y2="9.5" />
                  </svg>
                  <span>{currentTrip.days} Days</span>
                </div>

                <div className="inline-flex items-center gap-2 text-white/90">
                  <svg
                    className="w-5 h-5 text-white/80"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="17" rx="2.5" />
                    <line x1="16" y1="2.5" x2="16" y2="6.5" />
                    <line x1="8" y1="2.5" x2="8" y2="6.5" />
                  </svg>
                  <span>{currentTrip.startDate}</span>
                  <span className="text-white/60">→</span>
                  <span>{currentTrip.endDate}</span>
                </div>
              </div>

              <p className="mt-3.5 text-white/85 text-[14px] leading-relaxed max-w-lg">
                {currentTrip.description}
              </p>
            </div>

            <div className="hidden lg:block text-right self-end pb-1 pr-2">
              <span className="font-caveat text-white/95 text-[34px] leading-[1.08] block drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] rotate-[-4deg]">
                Good
                <br />
                Trips
                <br />
                Brighter
                <br />
                Stories
              </span>
            </div>
          </div>
        </section>

        {/* ================= INFORMATION & DOCUMENTS CARD ================= */}
        <div
          onClick={() => setIsDocsModalOpen(true)}
          className="mt-6 bg-white border border-[#e6ecf4] rounded-[18px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(16,24,40,0.04)] flex items-center justify-between cursor-pointer hover:shadow-[0_8px_22px_rgba(23,37,84,0.08)] transition group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-[#2563eb] text-white grid place-items-center shrink-0 shadow-[0_4px_14px_rgba(37,99,235,0.3)]">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#172554] tracking-tight group-hover:text-[#2563eb] transition">
                Information and documents
              </h2>
              <p className="text-[14px] text-[#64748b] mt-0.5">
                All important information for your trip in one place.
              </p>
            </div>
          </div>
          <svg
            className="w-5 h-5 text-[#94a3b8] group-hover:translate-x-1 transition group-hover:text-[#2563eb]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>

        {/* ================= ITINERARY SECTION ================= */}
        <div className="mt-8 bg-white border border-[#e6ecf4] rounded-[22px] p-6 sm:p-8 shadow-[0_2px_12px_rgba(16,24,40,0.04)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#f1f5f9]">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-[12px] bg-[#e8f0fe] text-[#2563eb] grid place-items-center shrink-0">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                  <line x1="9" y1="3" x2="9" y2="18" />
                  <line x1="15" y1="6" x2="15" y2="21" />
                </svg>
              </div>
              <div>
                <h2 className="text-[20px] font-extrabold text-[#172554] tracking-tight">
                  Itinerary
                </h2>
                <p className="text-[14px] text-[#64748b]">
                  Your day-by-day plan. Expand each event for more details.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                onClick={toggleExpandAll}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[13.5px] font-semibold text-[#334155] transition"
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${allExpanded ? "rotate-180" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                <span>{allExpanded ? "Collapse All" : "Expand All"}</span>
              </button>
            </div>
          </div>

          {/* Event Cards Stack */}
          <div className="mt-6 flex flex-col gap-4">
            {currentTrip.events.map((evt, idx) => {
              const isOpen = !!expandedEvents[evt.id];

              return (
                <article
                  key={evt.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`border rounded-[18px] transition-all duration-200 overflow-hidden ${
                    draggedIndex === idx
                      ? "opacity-40 border-dashed border-[#2563eb] bg-[#eff6ff] scale-[0.99] shadow-inner"
                      : dragOverIndex === idx
                      ? "border-2 border-[#2563eb] bg-[#f8fbff] shadow-[0_8px_28px_rgba(37,99,235,0.18)] scale-[1.01]"
                      : isOpen
                      ? "border-[#cbd7ea] bg-white shadow-[0_8px_24px_rgba(23,37,84,0.06)]"
                      : "border-[#e6ecf4] bg-white hover:border-[#cbd7ea] shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
                  }`}
                >
                  {/* Collapsed Header Bar */}
                  <div
                    onClick={() => toggleEvent(evt.id)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                      {/* Drag Handle Grip Icon */}
                      <div
                        className="cursor-grab active:cursor-grabbing p-1.5 -ml-1 text-[#94a3b8] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-[8px] transition shrink-0 flex items-center justify-center group/drag"
                        title="Drag and drop to rearrange"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-5 h-5 group-hover/drag:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="9" cy="6" r="1.6" />
                          <circle cx="15" cy="6" r="1.6" />
                          <circle cx="9" cy="12" r="1.6" />
                          <circle cx="15" cy="12" r="1.6" />
                          <circle cx="9" cy="18" r="1.6" />
                          <circle cx="15" cy="18" r="1.6" />
                        </svg>
                      </div>

                      <img
                        src={evt.coverImage}
                        alt={evt.title}
                        className="w-[84px] h-[58px] sm:w-[96px] sm:h-[64px] rounded-[12px] object-cover shrink-0 shadow-sm"
                      />

                      <div className="min-w-0">
                        <h3 className="text-[16.5px] sm:text-[17.5px] font-bold text-[#172554] truncate tracking-tight">
                          {evt.title}
                        </h3>

                        <div className="mt-1 flex items-center flex-wrap gap-x-3 gap-y-1 text-[13px] sm:text-[13.5px] text-[#64748b]">
                          <span className="font-medium text-[#475569]">{evt.date}</span>
                          <span className="text-[#cbd5e1]">•</span>
                          <span>{evt.duration}</span>
                          <span className="text-[#cbd5e1]">•</span>
                          <span className="inline-flex items-center gap-1 truncate text-[#64748b]">
                            <svg
                              className="w-3.5 h-3.5 text-[#2563eb] shrink-0"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            {evt.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions: Edit, Delete, Expand/Collapse */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {/* Attach Document Button */}
                      <button
                        type="button"
                        onClick={(e) => handleOpenAddDocForEvent(evt.id, e)}
                        title="Add Document to this Event"
                        className="w-8 h-8 rounded-[8px] grid place-items-center text-[#475569] hover:text-[#2563eb] hover:bg-[#eff6ff] border border-transparent hover:border-[#bfdbfe] transition"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="12" y1="18" x2="12" y2="12" />
                          <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                      </button>

                      {/* Edit Event Button */}
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditEvent(evt, e)}
                        title="Edit Event Components"
                        className="w-8 h-8 rounded-[8px] grid place-items-center text-[#475569] hover:text-[#2563eb] hover:bg-[#eff6ff] border border-transparent hover:border-[#bfdbfe] transition"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      {/* Delete Event Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteEventConfirmId(evt.id);
                        }}
                        title="Delete Event"
                        className="w-8 h-8 rounded-[8px] grid place-items-center text-[#94a3b8] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>

                      {/* Expand/Collapse Chevron */}
                      <button
                        type="button"
                        onClick={() => toggleEvent(evt.id)}
                        className={`w-8 h-8 rounded-full grid place-items-center shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-[#2563eb]" : "text-[#94a3b8] hover:text-[#475569]"
                        }`}
                        aria-label={isOpen ? "Collapse" : "Expand"}
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content Panel */}
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-3 border-t border-[#f1f5f9] animate-[fadeIn_0.2s_ease] space-y-6">
                      {/* Description Section - Full Width with Quick-Edit */}
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-[14.5px] font-bold text-[#172554]">
                            <svg
                              className="w-4 h-4 text-[#2563eb]"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                            <span>Description</span>
                          </div>
                          {editingDescId !== evt.id && (
                            <button
                              type="button"
                              onClick={(e) => handleStartEditDesc(evt.id, evt.description, e)}
                              className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#64748b] hover:text-[#2563eb] bg-[#f8fafc] hover:bg-[#eff6ff] px-2 py-0.5 rounded-[6px] transition border border-[#e2e8f0]"
                            >
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                              Edit
                            </button>
                          )}
                        </div>

                        {editingDescId === evt.id ? (
                          <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                            <RichTextEditor
                              value={editingDescText}
                              onChange={setEditingDescText}
                              placeholder="Write description with font sizes, families, bold, italics, highlights, alignments, lists..."
                              minHeight="min-h-[140px]"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveDesc(evt.id)}
                                className="px-4 py-2 rounded-[8px] text-[13px] font-semibold bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition shadow-xs"
                              >
                                Save Description
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingDescId(null)}
                                className="px-3.5 py-2 rounded-[8px] text-[13px] text-[#64748b] hover:bg-[#f1f5f9] transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="text-[14px] leading-relaxed text-[#475569] w-full prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5"
                            dangerouslySetInnerHTML={{ __html: evt.description }}
                          />
                        )}
                      </div>

                      {/* Columns Layout: Photos | Additional Notes | [Documents] | Location */}
                      {(() => {
                        const eventDocs = (currentTrip.documents || []).filter(
                          (d) => d.eventId === evt.id
                        );
                        const hasDocs = eventDocs.length > 0;

                        return (
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start pt-1">
                            {/* Column 1: Images (Maximized) with Add & Delete capability */}
                            <div className={hasDocs ? "lg:col-span-4" : "lg:col-span-5"}>
                              <div className="flex items-center justify-between mb-2.5">
                                <div className="flex items-center gap-2 text-[14.5px] font-bold text-[#172554]">
                                  <svg
                                    className="w-4 h-4 text-[#2563eb]"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                  </svg>
                                  <span>
                                    Photos ({((evt.photos && evt.photos.length > 0) ? evt.photos : [evt.coverImage]).length})
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCardPhotoModalEventId(evt.id);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11.5px] font-semibold text-[#2563eb] bg-[#eff6ff] hover:bg-[#dbeafe] rounded-[7px] transition"
                                >
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                  </svg>
                                  Add Photo
                                </button>
                              </div>

                              <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5">
                                {((evt.photos && evt.photos.length > 0)
                                  ? evt.photos
                                  : [evt.coverImage]
                                ).map((photo, pIdx) => (
                                  <div
                                    key={pIdx}
                                    className="relative aspect-video rounded-[10px] overflow-hidden group/img shadow-sm border border-[#e6ecf4] bg-slate-100"
                                  >
                                    <img
                                      src={photo}
                                      alt={`Photo ${pIdx + 1}`}
                                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                                    />
                                    {/* Overlay with View and Delete actions */}
                                    <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <button
                                        type="button"
                                        title="View full image"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(photo, "_blank");
                                        }}
                                        className="w-7 h-7 rounded-full bg-white/95 text-slate-700 hover:text-[#2563eb] grid place-items-center shadow hover:scale-110 transition"
                                      >
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                          <circle cx="12" cy="12" r="3" />
                                        </svg>
                                      </button>
                                      <button
                                        type="button"
                                        title="Delete photo"
                                        onClick={(e) => handleDeletePhoto(evt.id, pIdx, e)}
                                        className="w-7 h-7 rounded-full bg-red-600 text-white hover:bg-red-700 grid place-items-center shadow hover:scale-110 transition"
                                      >
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                          <polyline points="3 6 5 6 21 6" />
                                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                ))}

                                {/* + Add Photo Tile */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCardPhotoModalEventId(evt.id);
                                  }}
                                  className="aspect-video rounded-[10px] border-2 border-dashed border-[#cbd5e1] hover:border-[#2563eb] bg-[#f8fafc] hover:bg-[#eff6ff] flex flex-col items-center justify-center gap-1 text-[#64748b] hover:text-[#2563eb] transition group/slot"
                                >
                                  <svg className="w-4 h-4 group-hover/slot:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                  </svg>
                                  <span className="text-[11px] font-semibold">+ Add</span>
                                </button>
                              </div>
                            </div>

                            {/* Column 2: Additional Notes */}
                            <div className={hasDocs ? "lg:col-span-3" : "lg:col-span-4"}>
                              <div className="flex items-center justify-between mb-2.5">
                                <div className="flex items-center gap-2 text-[14.5px] font-bold text-[#172554]">
                                  <svg
                                    className="w-4 h-4 text-[#2563eb]"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M11 4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                  <span>Additional Notes</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {!hasDocs && (
                                    <button
                                      type="button"
                                      onClick={(e) => handleOpenAddDocForEvent(evt.id, e)}
                                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[#64748b] hover:text-[#2563eb] bg-[#f8fafc] hover:bg-[#eff6ff] rounded-[7px] border border-[#e2e8f0] transition"
                                      title="Add a document to this card"
                                    >
                                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                      </svg>
                                      + Doc
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setInlineNoteOpen((prev) => ({ ...prev, [evt.id]: !prev[evt.id] }));
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11.5px] font-semibold text-[#2563eb] bg-[#eff6ff] hover:bg-[#dbeafe] rounded-[7px] transition"
                                  >
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                      <line x1="12" y1="5" x2="12" y2="19" />
                                      <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    Add Note
                                  </button>
                                </div>
                              </div>

                              <ul className="space-y-1.5 text-[13.5px] text-[#475569]">
                                {evt.notes.map((note, nIdx) => (
                                  <li
                                    key={nIdx}
                                    className="flex items-start justify-between gap-2 group/note py-0.5 rounded px-1 hover:bg-[#f8fafc]"
                                  >
                                    <div className="flex items-start gap-2 min-w-0">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#64748b] mt-2 shrink-0" />
                                      <span className="break-words">{note}</span>
                                    </div>
                                    <button
                                      type="button"
                                      title="Delete note"
                                      onClick={(e) => handleDeleteNote(evt.id, nIdx, e)}
                                      className="opacity-0 group-hover/note:opacity-100 text-[#94a3b8] hover:text-red-600 transition p-0.5 rounded shrink-0"
                                    >
                                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                      </svg>
                                    </button>
                                  </li>
                                ))}
                              </ul>

                              {/* Inline Add Note Input */}
                              {inlineNoteOpen[evt.id] && (
                                <div className="mt-2.5 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="text"
                                    placeholder="Type a note & press Enter..."
                                    value={inlineNoteInputs[evt.id] || ""}
                                    onChange={(e) => setInlineNoteInputs((prev) => ({ ...prev, [evt.id]: e.target.value }))}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddInlineNote(evt.id);
                                      }
                                    }}
                                    className="flex-1 p-1.5 px-2.5 text-[12.5px] border border-[#cbd5e1] rounded-[7px] outline-none focus:border-[#2563eb] bg-white"
                                    autoFocus
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleAddInlineNote(evt.id)}
                                    className="px-3 py-1.5 text-[12px] font-semibold bg-[#2563eb] text-white rounded-[7px] hover:bg-[#1d4ed8] transition"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setInlineNoteOpen((prev) => ({ ...prev, [evt.id]: false }))}
                                    className="px-2.5 py-1.5 text-[12px] text-[#64748b] hover:bg-[#f1f5f9] rounded-[7px] transition"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Column 3: Documents Section (Shown when documents are assigned) */}
                            {hasDocs && (
                              <div className="lg:col-span-3">
                                <div className="flex items-center justify-between mb-2.5">
                                  <div className="flex items-center gap-2 text-[14.5px] font-bold text-[#172554]">
                                    <svg
                                      className="w-4 h-4 text-[#2563eb]"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                      <polyline points="14 2 14 8 20 8" />
                                      <line x1="16" y1="13" x2="8" y2="13" />
                                      <line x1="16" y1="17" x2="8" y2="17" />
                                    </svg>
                                    <span>Documents ({eventDocs.length})</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => handleOpenAddDocForEvent(evt.id, e)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11.5px] font-semibold text-[#2563eb] bg-[#eff6ff] hover:bg-[#dbeafe] rounded-[7px] transition"
                                  >
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                      <line x1="12" y1="5" x2="12" y2="19" />
                                      <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    Add Doc
                                  </button>
                                </div>

                                <div className="space-y-2">
                                  {eventDocs.map((doc) => {
                                    let docIconBg = "bg-[#e8f0fe] text-[#2563eb]";
                                    if (doc.type === "flight") docIconBg = "bg-[#e0f2fe] text-[#0284c7]";
                                    if (doc.type === "hotel") docIconBg = "bg-[#dcfce7] text-[#16a34a]";
                                    if (doc.type === "insurance") docIconBg = "bg-[#fee2e2] text-[#dc2626]";
                                    if (doc.type === "visa") docIconBg = "bg-[#f3e8ff] text-[#9333ea]";

                                    return (
                                      <div
                                        key={doc.id}
                                        className="p-2.5 rounded-[12px] border border-[#e2e8f0] bg-[#f8fafc] hover:bg-white hover:border-[#cbd5e1] hover:shadow-xs transition flex items-center justify-between gap-2 group/doc"
                                      >
                                        <div
                                          className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                                          onClick={() => {
                                            if (doc.fileUrl) window.open(doc.fileUrl, "_blank");
                                          }}
                                          title={doc.title}
                                        >
                                          <div className={`w-8 h-8 rounded-[8px] ${docIconBg} grid place-items-center shrink-0`}>
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                              <polyline points="14 2 14 8 20 8" />
                                            </svg>
                                          </div>
                                          <div className="min-w-0">
                                            <h5 className="text-[12.5px] font-bold text-[#172554] truncate group-hover/doc:text-[#2563eb] transition">
                                              {doc.title}
                                            </h5>
                                            <p className="text-[11px] text-[#64748b] truncate">
                                              {doc.fileName || doc.fileSize}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-0.5 shrink-0">
                                          {doc.fileUrl && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(doc.fileUrl, "_blank");
                                              }}
                                              title="View document"
                                              className="w-6 h-6 rounded-[5px] grid place-items-center text-[#64748b] hover:text-[#2563eb] hover:bg-white transition"
                                            >
                                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                              </svg>
                                            </button>
                                          )}
                                          <button
                                            type="button"
                                            onClick={(e) => handleUnassignDoc(doc.id, e)}
                                            title="Unassign document from card"
                                            className="w-6 h-6 rounded-[5px] grid place-items-center text-[#94a3b8] hover:text-red-600 hover:bg-white transition"
                                          >
                                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                              <line x1="18" y1="6" x2="6" y2="18" />
                                              <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}

                                  <button
                                    type="button"
                                    onClick={(e) => handleOpenAddDocForEvent(evt.id, e)}
                                    className="w-full py-1.5 px-2.5 border border-dashed border-[#cbd5e1] hover:border-[#2563eb] rounded-[9px] flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#64748b] hover:text-[#2563eb] bg-[#f8fafc] hover:bg-[#eff6ff] transition"
                                  >
                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                      <line x1="12" y1="5" x2="12" y2="19" />
                                      <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    + Attach another document
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Column 4: Location Card (Compressed even smaller when documents are present) */}
                            <div className={hasDocs ? "lg:col-span-2" : "lg:col-span-3"}>
                              <div className="flex items-center gap-1.5 text-[14px] font-bold text-[#172554] mb-2">
                                <svg
                                  className="w-3.5 h-3.5 text-[#2563eb]"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                  <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span className="truncate">Location</span>
                              </div>

                              <div className={`relative w-full ${hasDocs ? "h-[80px]" : "h-[95px]"} rounded-[12px] overflow-hidden border border-[#dce5f1] bg-[#eef4fb] shadow-sm`}>
                                <svg
                                  className="absolute inset-0 w-full h-full text-[#dbe7f5]"
                                  preserveAspectRatio="none"
                                  viewBox="0 0 400 150"
                                  fill="none"
                                >
                                  <rect width="400" height="150" fill="#f4f8fc" />
                                  <path
                                    d="M-20,40 Q100,10 200,80 T420,110"
                                    stroke="#e1ebf6"
                                    strokeWidth="18"
                                  />
                                  <path
                                    d="M30,-20 Q120,60 180,160"
                                    stroke="#d4e3f3"
                                    strokeWidth="12"
                                  />
                                  <path
                                    d="M120,-10 Q220,110 380,50"
                                    stroke="#dcfce7"
                                    strokeWidth="14"
                                  />
                                  <circle cx="160" cy="70" r="6" fill="#3b82f6" opacity="0.2" />
                                </svg>

                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-1.5 py-0.5 rounded-full shadow-[0_2px_8px_rgba(15,23,42,0.12)] border border-[#e2e8f0] max-w-[94%]">
                                  <svg
                                    className="w-2.5 h-2.5 text-red-500 fill-red-500 shrink-0"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                  </svg>
                                  <span className="text-[10.5px] font-semibold text-[#1e293b] truncate">
                                    {evt.location}
                                  </span>
                                </div>

                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    evt.location
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="absolute bottom-1 right-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[5px] bg-white text-[#1e293b] text-[9.5px] font-semibold shadow-sm border border-[#e2e8f0] hover:bg-[#f8fafc] transition"
                                >
                                  Maps
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </article>
              );
            })}

            {/* ================= + ADD EVENT CARD (AT THE BOTTOM OF LAST EVENT) ================= */}
            <div
              onClick={() => setIsAddEventOpen(true)}
              className="border-2 border-dashed border-[#a9c3f2] rounded-[18px] p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 cursor-pointer hover:bg-white hover:border-[#2563eb] transition-all group shadow-sm bg-[#fbfcfe]"
            >
              <div className="w-12 h-12 rounded-full bg-[#2563eb] text-white grid place-items-center shadow-[0_6px_16px_rgba(37,99,235,0.35)] group-hover:scale-105 transition-transform shrink-0">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-[17.5px] font-bold text-[#172554] tracking-tight group-hover:text-[#2563eb] transition">
                  + Add Event
                </h3>
                <p className="text-[13.5px] text-[#64748b] mt-0.5">
                  Append a new activity, destination, or milestone to this trip&apos;s itinerary.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CHANGE BANNER MODAL ================= */}
      {isBannerModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm grid place-items-center z-50 p-4"
          onClick={() => setIsBannerModalOpen(false)}
        >
          <div
            className="bg-white rounded-[20px] w-full max-w-[500px] shadow-[0_24px_64px_rgba(2,8,23,0.35)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#eef2f7]">
              <h3 className="text-[18px] font-bold text-[#172554]">
                Change Top Banner Image
              </h3>
              <button
                onClick={() => setIsBannerModalOpen(false)}
                className="w-8 h-8 rounded-[8px] grid place-items-center text-[#64748b] hover:bg-[#f1f5f9]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#334155] mb-1.5">
                  Option 1: Paste Image URL Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={bannerInputUrl}
                    onChange={(e) => setBannerInputUrl(e.target.value)}
                    className="flex-1 p-2.5 border border-[#dfe6ee] rounded-[9px] text-[13.5px] text-[#1e293b] outline-none focus:border-[#2563eb]"
                  />
                  <button
                    type="button"
                    onClick={() => updateBannerImage(bannerInputUrl.trim())}
                    className="px-4 py-2.5 rounded-[9px] bg-[#2563eb] text-white text-[13.5px] font-semibold hover:bg-[#1d4ed8]"
                  >
                    Apply URL
                  </button>
                </div>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-3 text-gray-400 text-xs uppercase font-medium">Or</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#334155] mb-1.5">
                  Option 2: Upload from Local Device
                </label>
                <button
                  type="button"
                  onClick={() => bannerFileInputRef.current?.click()}
                  className="w-full py-3 px-4 border-2 border-dashed border-[#cbd5e1] hover:border-[#2563eb] rounded-[12px] flex items-center justify-center gap-2 text-[#334155] hover:text-[#2563eb] font-semibold text-[13.5px] transition bg-[#f8fafc]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Browse Local Image File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD EVENT MODAL ================= */}
      {isAddEventOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm grid place-items-center z-50 p-4"
          onClick={() => setIsAddEventOpen(false)}
        >
          <div
            className="bg-white rounded-[20px] w-full max-w-[580px] max-h-[92vh] overflow-auto shadow-[0_24px_64px_rgba(2,8,23,0.35)] animate-[pop_0.2s_ease]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-[#eef2f7]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-[#e8f0fe] text-[#2563eb] grid place-items-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                </div>
                <h3 className="text-[18px] font-bold text-[#172554]">
                  Add Itinerary Event
                </h3>
              </div>
              <button
                onClick={() => setIsAddEventOpen(false)}
                className="w-8 h-8 rounded-[8px] grid place-items-center text-[#64748b] hover:bg-[#f1f5f9] transition"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddEventSubmit} className="p-6 space-y-4">
              {/* Title & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#334155] mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hakone Hot Springs"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full p-2.5 border border-[#dfe6ee] rounded-[9px] text-[13.5px] text-[#1e293b] outline-none focus:border-[#2563eb]"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#334155] mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apr 15, 2025"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full p-2.5 border border-[#dfe6ee] rounded-[9px] text-[13.5px] text-[#1e293b] outline-none focus:border-[#2563eb]"
                  />
                </div>
              </div>

              {/* Start Time, End Time & Auto-Calculated Duration via Node.js engine */}
              <div className="p-3.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] space-y-2.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#475569] mb-1">
                      Starting Time
                    </label>
                    <input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => handleTimeChange("start", e.target.value)}
                      className="w-full p-2 bg-white border border-[#dfe6ee] rounded-[8px] text-[13.5px] text-[#1e293b] outline-none focus:border-[#2563eb]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#475569] mb-1">
                      Ending Time
                    </label>
                    <input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => handleTimeChange("end", e.target.value)}
                      className="w-full p-2 bg-white border border-[#dfe6ee] rounded-[8px] text-[13.5px] text-[#1e293b] outline-none focus:border-[#2563eb]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#e9eef5]">
                  <span className="text-[#64748b] flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-[#2563eb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Node.js Calculated Duration:
                  </span>
                  <span className="font-bold text-[#2563eb] bg-[#e8f0fe] px-2.5 py-0.5 rounded-full">
                    {newEvent.calculatedDuration}
                  </span>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-[12.5px] font-semibold text-[#334155] mb-1">
                  Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hakone, Kanagawa"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full p-2.5 border border-[#dfe6ee] rounded-[9px] text-[13.5px] text-[#1e293b] outline-none focus:border-[#2563eb]"
                />
              </div>

              {/* Cover Image: Upload or Paste Link */}
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-semibold text-[#334155]">
                  Event Cover Image (Upload or Paste Link)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Paste image URL..."
                    value={newEvent.coverImage}
                    onChange={(e) => setNewEvent({ ...newEvent, coverImage: e.target.value })}
                    className="flex-1 p-2.5 border border-[#dfe6ee] rounded-[9px] text-[13.5px] text-[#1e293b] outline-none focus:border-[#2563eb]"
                  />
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="px-3.5 py-2.5 border border-[#cbd5e1] hover:border-[#2563eb] rounded-[9px] text-[13px] font-semibold text-[#334155] bg-white hover:bg-[#f1f5f9] flex items-center gap-1.5 whitespace-nowrap transition"
                  >
                    <svg className="w-4 h-4 text-[#2563eb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload Local
                  </button>
                  <input
                    type="file"
                    ref={coverFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverFileUpload}
                  />
                </div>
                {newEvent.coverImage && (
                  <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-[#cbd5e1] mt-1">
                    <img src={newEvent.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Gallery Photos: Upload or Paste Link */}
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-semibold text-[#334155]">
                  Gallery Photos (Upload local or paste links)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Paste photo URL and click Add..."
                    value={newPhotoInputUrl}
                    onChange={(e) => setNewPhotoInputUrl(e.target.value)}
                    className="flex-1 p-2.5 border border-[#dfe6ee] rounded-[9px] text-[13.5px] text-[#1e293b] outline-none focus:border-[#2563eb]"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhotoUrl}
                    className="px-3 py-2.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-[9px] text-[13px] font-semibold text-[#334155] whitespace-nowrap"
                  >
                    + Add URL
                  </button>
                  <button
                    type="button"
                    onClick={() => photosFileInputRef.current?.click()}
                    className="px-3 py-2.5 border border-[#cbd5e1] hover:border-[#2563eb] rounded-[9px] text-[13px] font-semibold text-[#334155] bg-white hover:bg-[#f1f5f9] flex items-center gap-1.5 whitespace-nowrap transition"
                  >
                    <svg className="w-4 h-4 text-[#2563eb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload Files
                  </button>
                  <input
                    type="file"
                    ref={photosFileInputRef}
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotosFileUpload}
                  />
                </div>

                {newEvent.photos.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {newEvent.photos.map((p, idx) => (
                      <div key={idx} className="relative w-16 h-12 rounded-lg overflow-hidden border border-[#cbd5e1] group">
                        <img src={p} alt={`Photo ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 grid place-items-center transition text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[12.5px] font-semibold text-[#334155] mb-1">
                  Description
                </label>
                <RichTextEditor
                  value={newEvent.description}
                  onChange={(val) => setNewEvent({ ...newEvent, description: val })}
                  placeholder="Briefly describe what happens during this event..."
                  minHeight="min-h-[120px]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[12.5px] font-semibold text-[#334155] mb-1">
                  Additional Notes (one per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="Book tickets in advance&#10;Bring walking shoes"
                  value={newEvent.notes}
                  onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                  className="w-full p-2.5 border border-[#dfe6ee] rounded-[9px] text-[13.5px] text-[#1e293b] outline-none focus:border-[#2563eb] resize-y"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(false)}
                  className="px-4 py-2.5 rounded-[9px] text-[13.5px] font-semibold border border-[#dbe3ec] bg-white text-[#334155] hover:bg-[#f5f8fb] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-[9px] text-[13.5px] font-semibold bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition shadow-[0_4px_12px_rgba(37,99,235,0.2)]"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= INFORMATION & DOCUMENTS MODAL ================= */}
      {isDocsModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm grid place-items-center z-50 p-4"
          onClick={() => {
            setIsDocsModalOpen(false);
            setActiveDocMenuId(null);
          }}
        >
          <div
            className="bg-white rounded-[24px] w-full max-w-[500px] max-h-[92vh] flex flex-col shadow-[0_24px_64px_rgba(2,8,23,0.35)] overflow-hidden animate-[pop_0.2s_ease]"
            onClick={(e) => {
              e.stopPropagation();
              setActiveDocMenuId(null);
            }}
          >
            {/* Modal Header matching screenshot */}
            <div className="p-6 pb-4 flex items-start justify-between border-b border-[#f1f5f9]">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-[14px] bg-[#2563eb] text-white grid place-items-center shrink-0 shadow-[0_4px_14px_rgba(37,99,235,0.3)]">
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[19px] font-bold text-[#172554] tracking-tight">
                    Information and documents
                  </h3>
                  <p className="text-[13.5px] text-[#64748b] mt-0.5">
                    All important information for your trip in one place.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsDocsModalOpen(false);
                  setActiveDocMenuId(null);
                }}
                className="w-8 h-8 rounded-[8px] grid place-items-center text-[#64748b] hover:bg-[#f1f5f9] transition -mr-1"
                aria-label="Close documents modal"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body: Document Cards List */}
            <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
              {((currentTrip.documents && currentTrip.documents.length > 0)
                ? currentTrip.documents
                : []
              ).map((doc) => {
                let iconBg = "bg-[#e8f0fe] text-[#2563eb]";
                let iconSvg = (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="3" width="14" height="18" rx="2" />
                    <circle cx="12" cy="11" r="3.5" />
                    <path d="M12 7.5v7" />
                    <path d="M8.5 11h7" />
                  </svg>
                );

                if (doc.type === "passport") {
                  iconBg = "bg-[#e8f0fe] text-[#2563eb]";
                  iconSvg = (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1z" />
                    </svg>
                  );
                } else if (doc.type === "flight") {
                  iconBg = "bg-[#e0f2fe] text-[#0284c7]";
                  iconSvg = (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                    </svg>
                  );
                } else if (doc.type === "hotel") {
                  iconBg = "bg-[#dcfce7] text-[#16a34a]";
                  iconSvg = (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" />
                    </svg>
                  );
                } else if (doc.type === "insurance") {
                  iconBg = "bg-[#fee2e2] text-[#dc2626]";
                  iconSvg = (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                    </svg>
                  );
                } else if (doc.type === "visa") {
                  iconBg = "bg-[#f3e8ff] text-[#9333ea]";
                  iconSvg = (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                    </svg>
                  );
                }

                return (
                  <div
                    key={doc.id}
                    className="relative bg-white border border-[#e6ecf4] rounded-[16px] p-4 flex items-center justify-between gap-3 shadow-[0_1px_3px_rgba(16,24,40,0.03)] hover:border-[#cbd5e1] hover:shadow-[0_4px_14px_rgba(16,24,40,0.06)] transition group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-[52px] h-[52px] rounded-[14px] ${iconBg} grid place-items-center shrink-0`}>
                        {iconSvg}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-[15.5px] font-bold text-[#172554] tracking-tight truncate">
                            {doc.title}
                          </h4>
                          {doc.eventId && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]">
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                              </svg>
                              Card: {currentTrip.events.find((e) => e.id === doc.eventId)?.title || "Assigned"}
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] text-[#64748b] leading-[1.35] line-clamp-2 mt-0.5">
                          {doc.description}
                        </p>
                        <div className="flex items-center gap-2 text-[12px] text-[#94a3b8] mt-1">
                          <span className="font-medium text-[#64748b] truncate max-w-[170px]">
                            {doc.fileName}
                          </span>
                          <span>•</span>
                          <span>{doc.fileSize}</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() =>
                          setActiveDocMenuId(activeDocMenuId === doc.id ? null : doc.id)
                        }
                        className="w-8 h-8 rounded-full grid place-items-center text-[#94a3b8] hover:text-[#475569] hover:bg-[#f1f5f9] transition"
                        aria-label="Document options"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="5" r="1.75" />
                          <circle cx="12" cy="12" r="1.75" />
                          <circle cx="12" cy="19" r="1.75" />
                        </svg>
                      </button>

                      {activeDocMenuId === doc.id && (
                        <div className="absolute right-0 top-9 bg-white border border-[#e2e8f0] rounded-[10px] shadow-[0_10px_24px_rgba(15,23,42,0.15)] p-1 min-w-[140px] z-50 animate-[pop_0.15s_ease]">
                          <button
                            onClick={() => {
                              setActiveDocMenuId(null);
                              if (doc.fileUrl) {
                                window.open(doc.fileUrl, "_blank");
                              } else {
                                showToast(`Downloading ${doc.fileName} (demo)`);
                              }
                            }}
                            className="flex items-center gap-2 w-full p-2 text-left text-[12.5px] font-semibold text-[#1e293b] hover:bg-[#f1f5f9] rounded-[6px]"
                          >
                            <svg className="w-3.5 h-3.5 text-[#2563eb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Download
                          </button>
                          {doc.eventId && (
                            <button
                              onClick={() => {
                                handleUnassignDoc(doc.id);
                                setActiveDocMenuId(null);
                              }}
                              className="flex items-center gap-2 w-full p-2 text-left text-[12.5px] font-semibold text-[#b45309] hover:bg-[#fffbeb] rounded-[6px]"
                            >
                              <svg className="w-3.5 h-3.5 text-[#b45309]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                              Unassign Card
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="flex items-center gap-2 w-full p-2 text-left text-[12.5px] font-semibold text-[#dc2626] hover:bg-[#fef2f2] rounded-[6px]"
                          >
                            <svg className="w-3.5 h-3.5 text-[#dc2626]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* + Add More Documents Card matching screenshot */}
              <div
                onClick={() => handleOpenAddDocGeneral()}
                className="border-2 border-dashed border-[#a9c3f2] bg-[#f8fbff] rounded-[16px] p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white hover:border-[#2563eb] transition-all group"
              >
                <div className="flex items-center gap-2 text-[#2563eb] font-bold text-[15.5px]">
                  <span className="w-6 h-6 rounded-full bg-[#2563eb] text-white grid place-items-center text-sm shadow-[0_2px_8px_rgba(37,99,235,0.35)] group-hover:scale-105 transition-transform">
                    +
                  </span>
                  <span>Add More Documents</span>
                </div>
                <p className="text-[13px] text-[#64748b] mt-1">
                  Upload any additional documents for your trip.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD DOCUMENT FORM MODAL ================= */}
      {isAddDocModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm grid place-items-center z-50 p-4"
          onClick={() => setIsAddDocModalOpen(false)}
        >
          <div
            className="bg-white rounded-[20px] w-full max-w-[460px] shadow-[0_24px_64px_rgba(2,8,23,0.35)] p-6 animate-[pop_0.2s_ease]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#eef2f7]">
              <h3 className="text-[17.5px] font-bold text-[#172554]">
                Upload Trip Document
              </h3>
              <button
                onClick={() => setIsAddDocModalOpen(false)}
                className="w-8 h-8 rounded-[8px] grid place-items-center text-[#64748b] hover:bg-[#f1f5f9]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddDocSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[12.5px] font-semibold text-[#334155] mb-1">
                  Document Type
                </label>
                <select
                  value={newDocData.type}
                  onChange={(e) => {
                    const t = e.target.value as TripDocument["type"];
                    let cs: TripDocument["colorScheme"] = "blue";
                    if (t === "flight") cs = "sky";
                    if (t === "hotel") cs = "green";
                    if (t === "insurance") cs = "red";
                    if (t === "visa") cs = "purple";
                    setNewDocData({ ...newDocData, type: t, colorScheme: cs });
                  }}
                  className="w-full p-2.5 bg-white border border-[#dfe6ee] rounded-[9px] text-[13.5px] text-[#1e293b] outline-none focus:border-[#2563eb]"
                >
                  <option value="passport">Passport</option>
                  <option value="flight">Flight Itinerary</option>
                  <option value="hotel">Hotel Bookings</option>
                  <option value="insurance">Travel Insurance</option>
                  <option value="visa">Visa (if required)</option>
                  <option value="other">Other Document</option>
                </select>
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold text-[#334155] mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Return Flight Tickets"
                  value={newDocData.title}
                  onChange={(e) => setNewDocData({ ...newDocData, title: e.target.value })}
                  className="w-full p-2.5 border border-[#dfe6ee] rounded-[9px] text-[13.5px] text-[#1e293b] outline-none focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold text-[#334155] mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Confirmed tickets for flight NH802"
                  value={newDocData.description}
                  onChange={(e) => setNewDocData({ ...newDocData, description: e.target.value })}
                  className="w-full p-2.5 border border-[#dfe6ee] rounded-[9px] text-[13.5px] text-[#1e293b] outline-none focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold text-[#334155] mb-1">
                  Assign to Itinerary Event (Optional)
                </label>
                <select
                  value={newDocData.eventId || ""}
                  onChange={(e) =>
                    setNewDocData({
                      ...newDocData,
                      eventId: e.target.value,
                    })
                  }
                  className="w-full p-2.5 bg-white border border-[#dfe6ee] rounded-[9px] text-[13.5px] text-[#1e293b] outline-none focus:border-[#2563eb]"
                >
                  <option value="">None (General Trip Document)</option>
                  {(currentTrip.events || []).map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title} ({evt.duration || evt.date})
                    </option>
                  ))}
                </select>
                <p className="text-[11.5px] text-[#64748b] mt-1">
                  If assigned, this document will appear inside that event card under Documents column.
                </p>
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold text-[#334155] mb-1">
                  Attach File (PDF or Image)
                </label>
                <button
                  type="button"
                  onClick={() => docFileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 border border-dashed border-[#cbd5e1] hover:border-[#2563eb] rounded-[9px] text-[13px] font-semibold text-[#334155] bg-[#f8fafc] flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 text-[#2563eb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {newDocData.fileName ? newDocData.fileName : "Choose Local File"}
                </button>
                <input
                  type="file"
                  ref={docFileInputRef}
                  accept=".pdf,image/*,.doc,.docx"
                  className="hidden"
                  onChange={handleDocFileUpload}
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddDocModalOpen(false)}
                  className="px-4 py-2 rounded-[9px] text-[13px] font-semibold border border-[#dbe3ec] bg-white text-[#334155]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-[9px] text-[13px] font-semibold bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
                >
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT EVENT MODAL ================= */}
      {isEditEventOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm grid place-items-center z-50 p-4"
          onClick={() => setIsEditEventOpen(false)}
        >
          <div
            className="bg-white rounded-[20px] w-full max-w-[620px] max-h-[92vh] overflow-auto shadow-[0_24px_64px_rgba(2,8,23,0.35)] animate-[pop_0.2s_ease]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-[#eef2f7]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-[#e8f0fe] text-[#2563eb] grid place-items-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
                <h3 className="text-[18px] font-bold text-[#172554]">
                  Edit Itinerary Event
                </h3>
              </div>
              <button
                onClick={() => setIsEditEventOpen(false)}
                className="w-8 h-8 rounded-[8px] grid place-items-center text-[#64748b] hover:bg-[#f1f5f9] transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveEditEvent} className="p-6 space-y-4">
              {/* Title & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#334155] mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editEventData.title}
                    onChange={(e) => setEditEventData({ ...editEventData, title: e.target.value })}
                    className="w-full p-2.5 border border-[#dfe6ee] rounded-[9px] text-[13.5px] text-[#1e293b] outline-none focus:border-[#2563eb]"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#334155] mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    value={editEventData.date}
                    onChange={(e) => setEditEventData({ ...editEventData, date: e.target.value })}
                    className="w-full p-2.5 border border-[#dfe6ee] rounded-[9px] text-[13.5px] text-[#1e293b] outline-none focus:border-[#2563eb]"
                  />
                </div>
              </div>

              {/* Start Time, End Time & Auto-Calculated Duration */}
              <div className="p-3.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] space-y-2.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#475569] mb-1">
                      Starting Time
                    </label>
                    <input
                      type="time"
                      value={editEventData.startTime}
                      onChange={(e) => handleEditTimeChange("start", e.target.value)}
                      className="w-full p-2 bg-white border border-[#dfe6ee] rounded-[8px] text-[13.5px] text-[#1e293b] outline-none focus:border-[#2563eb]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#475569] mb-1">
                      Ending Time
                    </label>
                    <input
                      type="time"
                      value={editEventData.endTime}
                      onChange={(e) => handleEditTimeChange("end", e.target.value)}
                      className="w-full p-2 bg-white border border-[#dfe6ee] rounded-[8px] text-[13.5px] text-[#1e293b] outline-none focus:border-[#2563eb]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#e9eef5]">
                  <span className="text-[#64748b] flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-[#2563eb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Node.js Calculated Duration:
                  </span>
                  <span className="font-bold text-[#2563eb] bg-[#e8f0fe] px-2.5 py-0.5 rounded-full">
                    {editEventData.calculatedDuration}
                  </span>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-[12.5px] font-semibold text-[#334155] mb-1">
                  Location
                </label>
                <input
                  type="text"
                  required
                  value={editEventData.location}
                  onChange={(e) => setEditEventData({ ...editEventData, location: e.target.value })}
                  className="w-full p-2.5 border border-[#dfe6ee] rounded-[9px] text-[13.5px] text-[#1e293b] outline-none focus:border-[#2563eb]"
                />
              </div>

              {/* Cover Image */}
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-semibold text-[#334155]">
                  Event Cover Image (Upload or Paste Link)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Paste image URL..."
                    value={editEventData.coverImage}
                    onChange={(e) => setEditEventData({ ...editEventData, coverImage: e.target.value })}
                    className="flex-1 p-2.5 border border-[#dfe6ee] rounded-[9px] text-[13.5px] text-[#1e293b] outline-none focus:border-[#2563eb]"
                  />
                  <button
                    type="button"
                    onClick={() => editCoverFileInputRef.current?.click()}
                    className="px-3.5 py-2.5 border border-[#cbd5e1] hover:border-[#2563eb] rounded-[9px] text-[13px] font-semibold text-[#334155] bg-white hover:bg-[#f1f5f9] flex items-center gap-1.5 whitespace-nowrap transition"
                  >
                    <svg className="w-4 h-4 text-[#2563eb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload Local
                  </button>
                  <input
                    type="file"
                    ref={editCoverFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleEditCoverUpload}
                  />
                </div>
                {editEventData.coverImage && (
                  <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-[#cbd5e1] mt-1">
                    <img src={editEventData.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Gallery Photos */}
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-semibold text-[#334155]">
                  Gallery Photos (Upload local or paste links)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Paste photo URL and click Add..."
                    value={editPhotoInputUrl}
                    onChange={(e) => setEditPhotoInputUrl(e.target.value)}
                    className="flex-1 p-2.5 border border-[#dfe6ee] rounded-[9px] text-[13.5px] text-[#1e293b] outline-none focus:border-[#2563eb]"
                  />
                  <button
                    type="button"
                    onClick={handleAddEditPhotoUrl}
                    className="px-3 py-2.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-[9px] text-[13px] font-semibold text-[#334155] whitespace-nowrap"
                  >
                    + Add URL
                  </button>
                  <button
                    type="button"
                    onClick={() => editPhotosFileInputRef.current?.click()}
                    className="px-3 py-2.5 border border-[#cbd5e1] hover:border-[#2563eb] rounded-[9px] text-[13px] font-semibold text-[#334155] bg-white hover:bg-[#f1f5f9] flex items-center gap-1.5 whitespace-nowrap transition"
                  >
                    <svg className="w-4 h-4 text-[#2563eb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload Files
                  </button>
                  <input
                    type="file"
                    ref={editPhotosFileInputRef}
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleEditPhotosUpload}
                  />
                </div>

                {editEventData.photos.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {editEventData.photos.map((p, idx) => (
                      <div key={idx} className="relative w-16 h-12 rounded-lg overflow-hidden border border-[#cbd5e1] group">
                        <img src={p} alt={`Photo ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveEditPhoto(idx)}
                          className="absolute inset-0 bg-red-600/70 text-white opacity-0 group-hover:opacity-100 grid place-items-center transition text-xs font-bold"
                          title="Delete photo"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[12.5px] font-semibold text-[#334155] mb-1">
                  Description
                </label>
                <RichTextEditor
                  value={editEventData.description}
                  onChange={(val) => setEditEventData({ ...editEventData, description: val })}
                  placeholder="Write description with font sizes, families, bold, italics, highlights, alignments, lists..."
                  minHeight="min-h-[140px]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[12.5px] font-semibold text-[#334155] mb-1">
                  Additional Notes (one per line)
                </label>
                <textarea
                  rows={3}
                  value={editEventData.notes}
                  onChange={(e) => setEditEventData({ ...editEventData, notes: e.target.value })}
                  className="w-full p-2.5 border border-[#dfe6ee] rounded-[9px] text-[13.5px] text-[#1e293b] outline-none focus:border-[#2563eb] resize-y"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#eef2f7]">
                <button
                  type="button"
                  onClick={() => setIsEditEventOpen(false)}
                  className="px-4 py-2.5 rounded-[9px] text-[13.5px] font-semibold border border-[#dbe3ec] bg-white text-[#334155] hover:bg-[#f5f8fb] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-[9px] text-[13.5px] font-semibold bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition shadow-[0_4px_12px_rgba(37,99,235,0.2)]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADD PHOTO TO CARD MODAL ================= */}
      {cardPhotoModalEventId && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm grid place-items-center z-50 p-4"
          onClick={() => {
            setCardPhotoModalEventId(null);
            setCardPhotoUrlInput("");
          }}
        >
          <div
            className="bg-white rounded-[20px] w-full max-w-[480px] shadow-[0_24px_64px_rgba(2,8,23,0.35)] p-6 animate-[pop_0.2s_ease]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#eef2f7]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[8px] bg-[#eff6ff] text-[#2563eb] grid place-items-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <h3 className="text-[17.5px] font-bold text-[#172554]">
                  Add Photo to Event
                </h3>
              </div>
              <button
                onClick={() => {
                  setCardPhotoModalEventId(null);
                  setCardPhotoUrlInput("");
                }}
                className="w-8 h-8 rounded-[8px] grid place-items-center text-[#64748b] hover:bg-[#f1f5f9] transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#334155] mb-1.5">
                  Option 1: Paste Image URL Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={cardPhotoUrlInput}
                    onChange={(e) => setCardPhotoUrlInput(e.target.value)}
                    className="flex-1 p-2.5 border border-[#dfe6ee] rounded-[9px] text-[13.5px] text-[#1e293b] outline-none focus:border-[#2563eb]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddPhotoToEvent(cardPhotoModalEventId, cardPhotoUrlInput)}
                    className="px-4 py-2.5 rounded-[9px] bg-[#2563eb] text-white text-[13.5px] font-semibold hover:bg-[#1d4ed8] transition"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-3 text-gray-400 text-xs uppercase font-medium">Or</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#334155] mb-1.5">
                  Option 2: Upload from Local Device
                </label>
                <button
                  type="button"
                  onClick={() => cardPhotoFileInputRef.current?.click()}
                  className="w-full py-3 px-4 border-2 border-dashed border-[#cbd5e1] hover:border-[#2563eb] rounded-[12px] flex items-center justify-center gap-2 text-[#334155] hover:text-[#2563eb] font-semibold text-[13.5px] transition bg-[#f8fafc]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Browse Device Photos
                </button>
                <input
                  type="file"
                  ref={cardPhotoFileInputRef}
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleCardPhotoFileUpload(cardPhotoModalEventId, e)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE EVENT CONFIRMATION MODAL ================= */}
      {deleteEventConfirmId && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm grid place-items-center z-50 p-4"
          onClick={() => setDeleteEventConfirmId(null)}
        >
          <div
            className="bg-white rounded-[20px] w-full max-w-[440px] shadow-[0_24px_64px_rgba(2,8,23,0.35)] p-6 animate-[pop_0.2s_ease]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 grid place-items-center shrink-0">
                <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </div>
              <h3 className="text-[18px] font-bold text-[#172554]">
                Delete Event?
              </h3>
            </div>

            <p className="text-[14px] text-[#64748b] leading-relaxed">
              Are you sure you want to delete this event from the itinerary? This card and its associated photos and notes will be removed.
            </p>

            <div className="flex justify-end gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setDeleteEventConfirmId(null)}
                className="px-4 py-2 rounded-[9px] text-[13.5px] font-semibold border border-[#dbe3ec] bg-white text-[#334155] hover:bg-[#f8fafc] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteEvent(deleteEventConfirmId)}
                className="px-5 py-2 rounded-[9px] text-[13.5px] font-semibold bg-red-600 text-white hover:bg-red-700 transition shadow-[0_4px_12px_rgba(220,38,38,0.25)]"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TOAST ================= */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0f172a] text-white px-5 py-2.5 rounded-[10px] text-[13.5px] font-medium shadow-[0_12px_30px_rgba(2,8,23,0.35)] z-[200] transition-all duration-200 pointer-events-none ${
          toastMsg ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {toastMsg}
      </div>
    </div>
  );
}
