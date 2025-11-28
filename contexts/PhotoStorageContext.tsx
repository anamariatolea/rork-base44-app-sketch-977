import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

export type StoredPhoto = {
  id: string;
  uri: string;
  base64?: string;
  caption: string;
  description?: string;
  date: string;
  category: "memory" | "vision-board" | "general";
  mood?: string;
  tags?: string[];
  relationshipMoment?: string;
  aiInsight?: string;
  likes?: number;
  visionCategory?: "travel" | "dates" | "financial" | "lifestyle";
};

const STORAGE_KEY = "@photo_storage_v1";

export const [PhotoStorageProvider, usePhotoStorage] = createContextHook(() => {
  const [photos, setPhotos] = useState<StoredPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      console.log("Loading photos from storage...");
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPhotos(parsed);
        console.log(`Loaded ${parsed.length} photos from storage`);
      }
    } catch (error) {
      console.error("Error loading photos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePhotos = async (updatedPhotos: StoredPhoto[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPhotos));
      console.log(`Saved ${updatedPhotos.length} photos to storage`);
    } catch (error) {
      console.error("Error saving photos:", error);
    }
  };

  const addPhoto = async (photo: Omit<StoredPhoto, "id" | "date">) => {
    const newPhoto: StoredPhoto = {
      ...photo,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      likes: photo.likes || 0,
    };

    const updatedPhotos = [newPhoto, ...photos];
    setPhotos(updatedPhotos);
    await savePhotos(updatedPhotos);
    console.log("Photo added:", newPhoto.id);
    return newPhoto;
  };

  const updatePhoto = async (id: string, updates: Partial<StoredPhoto>) => {
    const updatedPhotos = photos.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    setPhotos(updatedPhotos);
    await savePhotos(updatedPhotos);
    console.log("Photo updated:", id);
  };

  const deletePhoto = async (id: string) => {
    const updatedPhotos = photos.filter((p) => p.id !== id);
    setPhotos(updatedPhotos);
    await savePhotos(updatedPhotos);
    console.log("Photo deleted:", id);
  };

  const getPhotosByCategory = (category: StoredPhoto["category"]) => {
    return photos.filter((p) => p.category === category);
  };

  const likePhoto = async (id: string) => {
    const photo = photos.find((p) => p.id === id);
    if (photo) {
      await updatePhoto(id, { likes: (photo.likes || 0) + 1 });
    }
  };

  return {
    photos,
    isLoading,
    addPhoto,
    updatePhoto,
    deletePhoto,
    getPhotosByCategory,
    likePhoto,
  };
});
