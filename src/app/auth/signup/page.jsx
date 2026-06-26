"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Display, Person, PersonFill } from "@gravity-ui/icons";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

// ─── World map dot data (lat/lng → x/y projection) ───────────────────────────
function latLngToXY(lat, lng, width, height) {
    const x = ((lng + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return { x, y };
}

const CITY_DOTS = [
    // North America
    { lat: 40.7, lng: -74.0 }, { lat: 34.05, lng: -118.24 }, { lat: 41.85, lng: -87.65 },
    { lat: 29.76, lng: -95.37 }, { lat: 33.45, lng: -112.07 }, { lat: 47.6, lng: -122.33 },
    { lat: 25.77, lng: -80.19 }, { lat: 45.5, lng: -73.57 }, { lat: 49.28, lng: -123.12 },
    { lat: 19.43, lng: -99.13 }, { lat: 23.13, lng: -82.38 }, { lat: 10.48, lng: -66.88 },
    // South America
    { lat: -23.55, lng: -46.63 }, { lat: -34.6, lng: -58.38 }, { lat: -12.05, lng: -77.03 },
    { lat: -33.45, lng: -70.67 }, { lat: 4.71, lng: -74.07 }, { lat: -15.78, lng: -47.93 },
    { lat: -3.1, lng: -60.02 }, { lat: -8.05, lng: -34.88 },
    // Europe
    { lat: 51.51, lng: -0.13 }, { lat: 48.85, lng: 2.35 }, { lat: 52.52, lng: 13.41 },
    { lat: 41.9, lng: 12.48 }, { lat: 40.42, lng: -3.7 }, { lat: 59.33, lng: 18.07 },
    { lat: 55.75, lng: 37.62 }, { lat: 50.45, lng: 30.52 }, { lat: 52.23, lng: 21.01 },
    { lat: 47.5, lng: 19.04 }, { lat: 48.21, lng: 16.37 }, { lat: 45.46, lng: 9.19 },
    { lat: 38.72, lng: -9.14 }, { lat: 53.33, lng: -6.25 }, { lat: 60.17, lng: 24.94 },
    { lat: 55.68, lng: 12.57 }, { lat: 59.91, lng: 10.75 }, { lat: 44.8, lng: 20.46 },
    // Africa
    { lat: 30.06, lng: 31.25 }, { lat: 6.45, lng: 3.4 }, { lat: -26.2, lng: 28.04 },
    { lat: -1.29, lng: 36.82 }, { lat: 14.69, lng: -17.44 }, { lat: 33.59, lng: -7.62 },
    { lat: 36.82, lng: 10.17 }, { lat: 15.55, lng: 32.53 }, { lat: -4.32, lng: 15.32 },
    { lat: -8.84, lng: 13.23 }, { lat: 5.35, lng: -4.0 }, { lat: -18.91, lng: 47.54 },
    { lat: -25.97, lng: 32.59 }, { lat: 12.37, lng: -1.53 },
    // Middle East
    { lat: 24.69, lng: 46.72 }, { lat: 25.2, lng: 55.27 }, { lat: 33.34, lng: 44.4 },
    { lat: 35.69, lng: 51.42 }, { lat: 31.77, lng: 35.22 }, { lat: 33.89, lng: 35.5 },
    // Asia
    { lat: 28.61, lng: 77.21 }, { lat: 19.08, lng: 72.88 }, { lat: 13.08, lng: 80.27 },
    { lat: 22.57, lng: 88.36 }, { lat: 23.73, lng: 90.4 }, { lat: 31.23, lng: 121.47 },
    { lat: 39.91, lng: 116.39 }, { lat: 22.33, lng: 114.19 }, { lat: 1.35, lng: 103.82 },
    { lat: 3.15, lng: 101.71 }, { lat: 13.75, lng: 100.52 }, { lat: 10.82, lng: 106.63 },
    { lat: 14.58, lng: 121.0 }, { lat: 35.69, lng: 139.69 }, { lat: 37.57, lng: 126.98 },
    { lat: 25.04, lng: 121.56 }, { lat: 41.29, lng: 69.24 }, { lat: 43.26, lng: 76.93 },
    { lat: 27.47, lng: 89.64 }, { lat: 33.72, lng: 73.06 }, { lat: 24.86, lng: 67.01 },
    { lat: 6.93, lng: 79.85 }, { lat: 47.9, lng: 106.92 },
    // Oceania
    { lat: -33.87, lng: 151.21 }, { lat: -37.81, lng: 144.96 }, { lat: -36.87, lng: 174.77 },
    { lat: -27.47, lng: 153.03 }, { lat: -31.95, lng: 115.86 },
];

// Dense filler points so the continents read as solid landmasses,
// rendered dimmer/smaller beneath the brighter CITY_DOTS layer above.
const FILL_DOTS = [
    { lat: 46.1, lng: -123.57 }, { lat: 34.08, lng: -112.28 }, { lat: 49.3, lng: -86.43 },
    { lat: 54.44, lng: -120.04 }, { lat: 38.92, lng: -123.3 }, { lat: 32.22, lng: -96.19 },
    { lat: 25.88, lng: -113.67 }, { lat: 46.45, lng: -93.94 }, { lat: 32.27, lng: -91.41 },
    { lat: 51.71, lng: -124.63 }, { lat: 51.59, lng: -85.21 }, { lat: 36.23, lng: -116.14 },
    { lat: 56.59, lng: -105.81 }, { lat: 52.97, lng: -90.59 }, { lat: 51.64, lng: -83.41 },
    { lat: 42.7, lng: -69.53 }, { lat: 37.49, lng: -93.53 }, { lat: 52.37, lng: -89.74 },
    { lat: 53.44, lng: -92.09 }, { lat: 48.25, lng: -122.39 }, { lat: 32.52, lng: -108.5 },
    { lat: 27.63, lng: -111.73 }, { lat: 28.33, lng: -109.16 }, { lat: 45.98, lng: -104.2 },
    { lat: 37.22, lng: -113.06 }, { lat: 33.81, lng: -71.61 }, { lat: 46.39, lng: -90.28 },
    { lat: 30.65, lng: -83.44 }, { lat: 30.39, lng: -103.37 }, { lat: 57.65, lng: -88.52 },
    { lat: 43.38, lng: -85.98 }, { lat: 52.81, lng: -80.77 }, { lat: 32.56, lng: -123.17 },
    { lat: 35.41, lng: -109.74 }, { lat: 31.96, lng: -71.25 }, { lat: 53.92, lng: -107.06 },
    { lat: 46.63, lng: -102.45 }, { lat: 55.18, lng: -98.85 }, { lat: 33.74, lng: -110.94 },
    { lat: 43.53, lng: -110.02 }, { lat: 44.29, lng: -73.82 }, { lat: 38.18, lng: -112.5 },
    { lat: 57.92, lng: -95.96 }, { lat: 51.14, lng: -100.94 }, { lat: 27.1, lng: -103.25 },
    { lat: 57.87, lng: -94.84 }, { lat: 47.5, lng: -94.39 }, { lat: 33.81, lng: -88.47 },
    { lat: 28.68, lng: -100.22 }, { lat: 39.97, lng: -70.63 }, { lat: 53.9, lng: -109.99 },
    { lat: 41.52, lng: -114.82 }, { lat: 34.85, lng: -88.58 }, { lat: 45.1, lng: -116.29 },
    { lat: 50.16, lng: -94.26 }, { lat: 50.69, lng: -94.77 }, { lat: 25.02, lng: -106.52 },
    { lat: 35.15, lng: -121.7 }, { lat: 50.27, lng: -117.68 }, { lat: 40.68, lng: -93.66 },
    { lat: 33.75, lng: -75.27 }, { lat: 38.96, lng: -112.93 }, { lat: 42.8, lng: -83.39 },
    { lat: 31.64, lng: -107.23 }, { lat: 57.84, lng: -87.96 }, { lat: 39.46, lng: -95.5 },
    { lat: 28.99, lng: -112.19 }, { lat: 36.16, lng: -91.47 }, { lat: 32.59, lng: -112.45 },
    { lat: 32.56, lng: -73.39 }, { lat: 53.37, lng: -120.96 }, { lat: 32.85, lng: -86.87 },
    { lat: 32.07, lng: -117.46 }, { lat: 55.87, lng: -92.45 }, { lat: 40.6, lng: -80.28 },
    { lat: 17.69, lng: -95.81 }, { lat: 9.16, lng: -90.52 }, { lat: 13.08, lng: -89.73 },
    { lat: 16.75, lng: -85.19 }, { lat: 19.81, lng: -97.83 }, { lat: 12.83, lng: -92.54 },
    { lat: 18.34, lng: -94.53 }, { lat: 10.28, lng: -90.13 }, { lat: 13.06, lng: -93.87 },
    { lat: 11.0, lng: -79.69 }, { lat: 13.32, lng: -81.05 }, { lat: 14.6, lng: -98.89 },
    { lat: 11.95, lng: -42.54 }, { lat: 9.92, lng: -38.39 }, { lat: 1.86, lng: -73.35 },
    { lat: -22.46, lng: -71.17 }, { lat: -37.23, lng: -44.93 }, { lat: -24.51, lng: -61.54 },
    { lat: 9.14, lng: -35.21 }, { lat: -17.76, lng: -47.95 }, { lat: -44.63, lng: -67.35 },
    { lat: 9.9, lng: -54.36 }, { lat: -18.67, lng: -46.59 }, { lat: -49.63, lng: -72.45 },
    { lat: -15.13, lng: -49.94 }, { lat: 4.65, lng: -69.67 }, { lat: -15.17, lng: -52.51 },
    { lat: -26.91, lng: -54.15 }, { lat: -19.97, lng: -38.0 }, { lat: -41.31, lng: -48.06 },
    { lat: -39.01, lng: -62.79 }, { lat: -10.0, lng: -67.2 }, { lat: -33.82, lng: -46.41 },
    { lat: 11.9, lng: -35.18 }, { lat: -50.09, lng: -71.19 }, { lat: 4.02, lng: -40.55 },
    { lat: 0.86, lng: -48.64 }, { lat: -14.02, lng: -35.59 }, { lat: -11.18, lng: -80.64 },
    { lat: -0.25, lng: -67.23 }, { lat: -10.55, lng: -37.81 }, { lat: -36.75, lng: -53.18 },
    { lat: -6.92, lng: -71.63 }, { lat: -12.51, lng: -68.86 }, { lat: 1.69, lng: -76.75 },
    { lat: -26.62, lng: -68.27 }, { lat: -12.31, lng: -68.95 }, { lat: -5.34, lng: -55.62 },
    { lat: 5.56, lng: -55.9 }, { lat: 0.92, lng: -54.2 }, { lat: -1.66, lng: -41.41 },
    { lat: 5.23, lng: -71.34 }, { lat: -2.73, lng: -40.33 }, { lat: -27.77, lng: -52.45 },
    { lat: 2.93, lng: -36.09 }, { lat: -0.68, lng: -40.45 }, { lat: -1.25, lng: -41.25 },
    { lat: -0.68, lng: -68.73 }, { lat: -2.25, lng: -76.03 }, { lat: 3.44, lng: -41.5 },
    { lat: -40.1, lng: -43.44 }, { lat: -24.16, lng: -66.96 }, { lat: -1.71, lng: -70.53 },
    { lat: -53.41, lng: -72.12 }, { lat: 9.78, lng: -68.16 }, { lat: -12.02, lng: -62.61 },
    { lat: 10.74, lng: -56.33 }, { lat: 58.54, lng: -4.5 }, { lat: 59.29, lng: -2.04 },
    { lat: 59.1, lng: 1.35 }, { lat: 38.6, lng: 7.95 }, { lat: 53.49, lng: 3.23 },
    { lat: 50.55, lng: 10.95 }, { lat: 45.24, lng: 13.49 }, { lat: 42.11, lng: 18.64 },
    { lat: 48.92, lng: 19.06 }, { lat: 53.81, lng: 17.15 }, { lat: 44.74, lng: -6.27 },
    { lat: 51.94, lng: 3.88 }, { lat: 43.53, lng: 24.07 }, { lat: 53.27, lng: 2.71 },
    { lat: 43.42, lng: 6.93 }, { lat: 45.66, lng: 2.53 }, { lat: 39.05, lng: 7.4 },
    { lat: 58.57, lng: 17.42 }, { lat: 57.67, lng: 15.01 }, { lat: 43.22, lng: 12.37 },
    { lat: 36.01, lng: 2.19 }, { lat: 46.32, lng: 13.62 }, { lat: 51.71, lng: 9.13 },
    { lat: 46.61, lng: -0.67 }, { lat: 47.36, lng: 26.15 }, { lat: 55.1, lng: -2.38 },
    { lat: 38.04, lng: 11.1 }, { lat: 51.19, lng: 4.07 }, { lat: 55.64, lng: 20.29 },
    { lat: 52.15, lng: -0.24 }, { lat: 40.78, lng: -8.05 }, { lat: 41.88, lng: 9.53 },
    { lat: 56.39, lng: -6.16 }, { lat: 45.95, lng: 15.56 }, { lat: 40.67, lng: 18.16 },
    { lat: 47.87, lng: 0.52 }, { lat: 51.75, lng: -8.78 }, { lat: 54.02, lng: 21.03 },
    { lat: 38.56, lng: 7.58 }, { lat: 48.43, lng: -7.04 }, { lat: 46.96, lng: 22.26 },
    { lat: 52.02, lng: 29.53 }, { lat: 50.29, lng: 28.05 }, { lat: 57.39, lng: 14.89 },
    { lat: 53.26, lng: 10.69 }, { lat: 55.93, lng: 12.37 }, { lat: 57.53, lng: 20.0 },
    { lat: 47.39, lng: 1.11 }, { lat: 41.93, lng: 15.87 }, { lat: 54.38, lng: 11.33 },
    { lat: 65.52, lng: 11.32 }, { lat: 58.93, lng: 11.57 }, { lat: 61.26, lng: 12.35 },
    { lat: 64.48, lng: 8.18 }, { lat: 60.78, lng: 20.96 }, { lat: 66.48, lng: 6.48 },
    { lat: 62.89, lng: 17.48 }, { lat: 62.99, lng: 9.76 }, { lat: 63.04, lng: 25.81 },
    { lat: 65.01, lng: 21.0 }, { lat: 26.83, lng: 32.76 }, { lat: -9.03, lng: 31.98 },
    { lat: 26.59, lng: 44.97 }, { lat: -4.25, lng: 31.59 }, { lat: 4.78, lng: 22.21 },
    { lat: -10.13, lng: 27.14 }, { lat: 10.18, lng: -15.25 }, { lat: -6.02, lng: 19.69 },
    { lat: -32.08, lng: 24.78 }, { lat: -24.37, lng: 13.01 }, { lat: -18.97, lng: 4.24 },
    { lat: 20.05, lng: 7.64 }, { lat: 19.39, lng: 37.08 }, { lat: -32.62, lng: 18.06 },
    { lat: 36.99, lng: 5.75 }, { lat: 12.16, lng: 33.78 }, { lat: 12.27, lng: 32.03 },
    { lat: 33.42, lng: -4.04 }, { lat: -25.04, lng: 26.51 }, { lat: 6.04, lng: -2.83 },
    { lat: 15.66, lng: 32.85 }, { lat: -22.09, lng: 22.47 }, { lat: 19.1, lng: -9.56 },
    { lat: 24.17, lng: 45.71 }, { lat: -11.85, lng: 27.03 }, { lat: 34.03, lng: 8.78 },
    { lat: 16.77, lng: -12.06 }, { lat: 15.03, lng: 23.77 }, { lat: -26.77, lng: 33.21 },
    { lat: 26.37, lng: 22.03 }, { lat: 21.57, lng: 5.57 }, { lat: -3.59, lng: 7.09 },
    { lat: 1.92, lng: 5.18 }, { lat: 26.32, lng: 36.45 }, { lat: 11.13, lng: 36.87 },
    { lat: 16.22, lng: 11.31 }, { lat: 18.1, lng: 45.76 }, { lat: -14.82, lng: 35.53 },
    { lat: 4.21, lng: 14.43 }, { lat: -3.07, lng: 30.52 }, { lat: -14.94, lng: 38.36 },
    { lat: 28.6, lng: -1.15 }, { lat: -1.01, lng: 22.67 }, { lat: 26.42, lng: -5.18 },
    { lat: -18.94, lng: 34.86 }, { lat: -9.84, lng: 40.22 }, { lat: 15.78, lng: 0.96 },
    { lat: -27.92, lng: 29.8 }, { lat: 0.69, lng: 32.28 }, { lat: 15.03, lng: 24.98 },
    { lat: 0.85, lng: 34.54 }, { lat: 15.12, lng: 2.9 }, { lat: 7.29, lng: 13.76 },
    { lat: 3.7, lng: 10.66 }, { lat: 18.96, lng: 4.5 }, { lat: 15.9, lng: 0.61 },
    { lat: 4.05, lng: 32.54 }, { lat: 0.38, lng: 30.1 }, { lat: 35.34, lng: 17.1 },
    { lat: 17.05, lng: 39.91 }, { lat: 16.67, lng: 34.37 }, { lat: 25.89, lng: 41.13 },
    { lat: 37.33, lng: 48.39 }, { lat: 30.13, lng: 37.28 }, { lat: 34.58, lng: 46.76 },
    { lat: 34.69, lng: 48.93 }, { lat: 24.2, lng: 45.45 }, { lat: 16.79, lng: 35.34 },
    { lat: 36.47, lng: 46.42 }, { lat: 33.38, lng: 44.42 }, { lat: 13.93, lng: 50.37 },
    { lat: 13.39, lng: 37.88 }, { lat: 26.63, lng: 41.9 }, { lat: 37.84, lng: 37.08 },
    { lat: 31.88, lng: 49.76 }, { lat: 32.56, lng: 39.87 }, { lat: 25.59, lng: 45.71 },
    { lat: 23.51, lng: 56.36 }, { lat: 37.74, lng: 41.94 }, { lat: 60.53, lng: 95.84 },
    { lat: 63.5, lng: 132.34 }, { lat: 50.19, lng: 52.79 }, { lat: 61.51, lng: 46.96 },
    { lat: 49.35, lng: 38.11 }, { lat: 45.07, lng: 78.65 }, { lat: 59.85, lng: 61.46 },
    { lat: 50.79, lng: 106.35 }, { lat: 62.57, lng: 79.04 }, { lat: 62.18, lng: 129.78 },
    { lat: 64.7, lng: 97.51 }, { lat: 61.53, lng: 130.84 }, { lat: 55.63, lng: 88.81 },
    { lat: 61.19, lng: 128.11 }, { lat: 65.67, lng: 37.71 }, { lat: 49.15, lng: 63.22 },
    { lat: 63.72, lng: 91.47 }, { lat: 52.22, lng: 43.43 }, { lat: 62.22, lng: 105.57 },
    { lat: 68.57, lng: 84.05 }, { lat: 57.34, lng: 38.69 }, { lat: 46.0, lng: 76.66 },
    { lat: 53.06, lng: 57.04 }, { lat: 65.9, lng: 92.12 }, { lat: 68.77, lng: 137.95 },
    { lat: 61.81, lng: 59.11 }, { lat: 46.01, lng: 111.68 }, { lat: 56.76, lng: 100.36 },
    { lat: 67.9, lng: 49.6 }, { lat: 59.63, lng: 98.56 }, { lat: 57.29, lng: 39.85 },
    { lat: 53.7, lng: 66.0 }, { lat: 61.75, lng: 122.64 }, { lat: 53.25, lng: 104.92 },
    { lat: 52.21, lng: 132.08 }, { lat: 65.34, lng: 89.41 }, { lat: 56.37, lng: 63.97 },
    { lat: 53.08, lng: 134.78 }, { lat: 55.1, lng: 85.58 }, { lat: 69.7, lng: 101.03 },
    { lat: 58.56, lng: 74.63 }, { lat: 49.69, lng: 69.07 }, { lat: 63.91, lng: 97.54 },
    { lat: 64.0, lng: 51.98 }, { lat: 58.73, lng: 130.19 }, { lat: 55.95, lng: 105.41 },
    { lat: 60.22, lng: 55.84 }, { lat: 48.96, lng: 89.49 }, { lat: 14.85, lng: 71.99 },
    { lat: 10.77, lng: 73.81 }, { lat: 27.45, lng: 102.38 }, { lat: 22.25, lng: 103.17 },
    { lat: 2.3, lng: 127.6 }, { lat: 34.11, lng: 83.28 }, { lat: 14.81, lng: 93.77 },
    { lat: 31.48, lng: 103.12 }, { lat: 2.43, lng: 124.25 }, { lat: 8.67, lng: 135.07 },
    { lat: 12.85, lng: 126.54 }, { lat: 2.73, lng: 87.39 }, { lat: 16.41, lng: 139.92 },
    { lat: 12.03, lng: 76.14 }, { lat: 14.24, lng: 90.88 }, { lat: 14.84, lng: 105.76 },
    { lat: 10.49, lng: 89.13 }, { lat: -1.51, lng: 117.31 }, { lat: 15.73, lng: 82.52 },
    { lat: 24.9, lng: 68.27 }, { lat: 26.51, lng: 93.96 }, { lat: 19.87, lng: 126.56 },
    { lat: 34.14, lng: 102.15 }, { lat: -8.33, lng: 102.67 }, { lat: 16.56, lng: 130.23 },
    { lat: 29.34, lng: 98.02 }, { lat: 13.67, lng: 99.27 }, { lat: 22.51, lng: 95.75 },
    { lat: 19.47, lng: 76.58 }, { lat: 11.13, lng: 137.69 }, { lat: 5.24, lng: 116.95 },
    { lat: 19.24, lng: 128.88 }, { lat: 7.1, lng: 88.75 }, { lat: -6.92, lng: 112.34 },
    { lat: 23.6, lng: 97.55 }, { lat: -5.57, lng: 112.53 }, { lat: 29.27, lng: 98.28 },
    { lat: -7.93, lng: 124.71 }, { lat: 3.2, lng: 93.11 }, { lat: -3.45, lng: 104.84 },
    { lat: 15.47, lng: 124.44 }, { lat: 0.84, lng: 133.46 }, { lat: -3.56, lng: 99.59 },
    { lat: 1.43, lng: 84.15 }, { lat: -2.89, lng: 98.13 }, { lat: 5.55, lng: 109.07 },
    { lat: 18.75, lng: 96.82 }, { lat: 1.25, lng: 128.4 }, { lat: 11.74, lng: 82.79 },
    { lat: 15.74, lng: 108.11 }, { lat: 34.67, lng: 87.14 }, { lat: 2.35, lng: 107.44 },
    { lat: -7.79, lng: 110.48 }, { lat: 12.35, lng: 132.81 }, { lat: 2.88, lng: 124.91 },
    { lat: 35.78, lng: 117.5 }, { lat: 36.55, lng: 129.32 }, { lat: 37.62, lng: 133.72 },
    { lat: 37.14, lng: 138.89 }, { lat: 36.33, lng: 141.75 }, { lat: 36.8, lng: 115.59 },
    { lat: 31.46, lng: 127.5 }, { lat: 39.04, lng: 105.97 }, { lat: 27.67, lng: 134.89 },
    { lat: 24.57, lng: 107.82 }, { lat: 34.02, lng: 144.75 }, { lat: 33.8, lng: 142.19 },
    { lat: 41.59, lng: 113.31 }, { lat: 41.44, lng: 123.2 }, { lat: 40.97, lng: 134.85 },
    { lat: 28.81, lng: 107.07 }, { lat: 45.04, lng: 108.19 }, { lat: 45.13, lng: 139.85 },
    { lat: 38.83, lng: 145.12 }, { lat: 45.15, lng: 137.4 }, { lat: 29.51, lng: 136.79 },
    { lat: 20.36, lng: 125.61 }, { lat: 31.82, lng: 131.6 }, { lat: 37.48, lng: 127.72 },
    { lat: 41.38, lng: 143.37 }, { lat: 22.82, lng: 112.29 }, { lat: 20.65, lng: 140.91 },
    { lat: 34.6, lng: 142.27 }, { lat: 25.76, lng: 104.78 }, { lat: 41.42, lng: 142.01 },
    { lat: 27.86, lng: 119.97 }, { lat: 23.63, lng: 143.64 }, { lat: 27.91, lng: 123.68 },
    { lat: 22.53, lng: 141.04 }, { lat: 23.53, lng: 121.96 }, { lat: 37.43, lng: 134.7 },
    { lat: 44.6, lng: 120.44 }, { lat: 39.3, lng: 108.8 }, { lat: -27.38, lng: 117.06 },
    { lat: -25.3, lng: 129.73 }, { lat: -28.63, lng: 131.18 }, { lat: -12.38, lng: 148.07 },
    { lat: -36.22, lng: 141.11 }, { lat: -23.75, lng: 153.09 }, { lat: -28.96, lng: 129.32 },
    { lat: -15.26, lng: 131.64 }, { lat: -20.44, lng: 139.31 }, { lat: -22.28, lng: 113.88 },
    { lat: -16.97, lng: 122.99 }, { lat: -35.47, lng: 136.15 }, { lat: -37.08, lng: 144.37 },
    { lat: -14.65, lng: 126.47 }, { lat: -34.87, lng: 149.92 }, { lat: -38.92, lng: 148.19 },
    { lat: -31.98, lng: 120.15 }, { lat: -20.49, lng: 114.06 }, { lat: -38.58, lng: 145.39 },
    { lat: -32.34, lng: 126.27 }, { lat: -18.23, lng: 134.57 }, { lat: -18.12, lng: 132.53 },
    { lat: -17.22, lng: 134.04 }, { lat: -35.95, lng: 133.66 }, { lat: -17.07, lng: 148.55 },
    { lat: -24.4, lng: 131.78 }, { lat: -34.47, lng: 166.79 }, { lat: -40.77, lng: 171.22 },
    { lat: -38.08, lng: 172.37 }, { lat: -35.17, lng: 166.96 }, { lat: -45.95, lng: 173.91 },
    { lat: -46.15, lng: 169.58 },
];

function WorldMapDots() {
    const W = 800, H = 400;
    const [pulseIdx, setPulseIdx] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setPulseIdx(Math.floor(Math.random() * CITY_DOTS.length));
        }, 1200);
        return () => clearInterval(id);
    }, []);

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            style={{ width: "100%", height: "100%", display: "block" }}
            aria-hidden="true"
        >
            {/* Dim fill layer — gives the continents their shape */}
            {FILL_DOTS.map((c, i) => {
                const { x, y } = latLngToXY(c.lat, c.lng, W, H);
                return (
                    <circle
                        key={`fill-${i}`}
                        cx={x} cy={y}
                        r={1.3}
                        fill="rgba(255,77,0,0.22)"
                    />
                );
            })}

            {/* Bright city layer — unchanged from before */}
            {CITY_DOTS.map((c, i) => {
                const { x, y } = latLngToXY(c.lat, c.lng, W, H);
                const isPulse = i === pulseIdx;
                return (
                    <g key={i}>
                        {isPulse && (
                            <circle cx={x} cy={y} r={6} fill="none" stroke="#ff4d00" strokeWidth={1} opacity={0.5}>
                                <animate attributeName="r" from="3" to="12" dur="1s" repeatCount="1" />
                                <animate attributeName="opacity" from="0.6" to="0" dur="1s" repeatCount="1" />
                            </circle>
                        )}
                        <circle
                            cx={x} cy={y}
                            r={isPulse ? 2.8 : 1.8}
                            fill={isPulse ? "#ff4d00" : "rgba(255,77,0,0.45)"}
                            style={{ transition: "all 0.3s" }}
                        />
                    </g>
                );
            })}

            {/* Subtle connection lines between a few cities */}
            {[
                [0, 10], [10, 20], [20, 30], [30, 40], [40, 50], [5, 25], [15, 45],
            ].map(([a, b], i) => {
                const p1 = latLngToXY(CITY_DOTS[a].lat, CITY_DOTS[a].lng, W, H);
                const p2 = latLngToXY(CITY_DOTS[b].lat, CITY_DOTS[b].lng, W, H);
                return (
                    <line
                        key={i}
                        x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                        stroke="rgba(255,77,0,0.12)" strokeWidth={0.6}
                        strokeDasharray="3 4"
                    />
                );
            })}
        </svg>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.20c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
            <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
        </svg>
    );
}

function LogoMark({ size = 32 }) {
    return (
        <div style={{
            width: size, height: size,
            borderRadius: size * 0.26,
            background: "linear-gradient(135deg,#ff4d00,#cc3d00)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(255,77,0,0.45)",
            flexShrink: 0,
        }}>
            <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 16 16" fill="none">
                <path d="M3 13L8 3L13 13" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 9.5H11" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
        </div>
    );
}

function InputField({ label, name, type = "text", placeholder, required, value, onChange, hint }) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label htmlFor={name} style={{
                fontSize: 11, fontWeight: 700,
                color: focused ? "#ff4d00" : "rgba(255,255,255,0.38)",
                letterSpacing: "0.14em", textTransform: "uppercase",
                transition: "color 0.2s", fontFamily: "monospace",
            }}>
                {label}
            </label>
            <div style={{ position: "relative" }}>
                <input
                    id={name} name={name} type={type}
                    placeholder={placeholder} required={required}
                    value={value} onChange={onChange}
                    autoComplete={type === "password" ? "new-password" : type === "email" ? "email" : "off"}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{
                        width: "100%",
                        padding: "11px 36px 11px 13px",
                        borderRadius: 10,
                        border: `1px solid ${focused ? "#ff4d00" : "rgba(255,255,255,0.09)"}`,
                        background: focused ? "rgba(255,77,0,0.05)" : "rgba(255,255,255,0.04)",
                        color: "#fff", fontSize: 14, outline: "none",
                        transition: "all 0.2s",
                        boxShadow: focused ? "0 0 0 3px rgba(255,77,0,0.10)" : "none",
                        boxSizing: "border-box",
                        fontFamily: "system-ui,sans-serif",
                    }}
                />
                {focused && (
                    <div style={{
                        position: "absolute", right: 13, top: "50%",
                        transform: "translateY(-50%)",
                        width: 6, height: 6, borderRadius: "50%",
                        background: "#ff4d00", boxShadow: "0 0 8px #ff4d00",
                    }} />
                )}
            </div>
            {hint && (
                <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.22)", margin: 0, fontFamily: "monospace", letterSpacing: "0.02em" }}>
                    {hint}
                </p>
            )}
        </div>
    );
}

function PasswordStrength({ password }) {
    const hasMin = password.length >= 6;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const score = [hasMin, hasUpper, hasLower].filter(Boolean).length;

    if (!password) return null;

    const rules = [
        { label: "6+ characters", met: hasMin },
        { label: "Uppercase letter", met: hasUpper },
        { label: "Lowercase letter", met: hasLower },
    ];

    const barColor = score === 3 ? "#22c55e" : score === 2 ? "#f59e0b" : "#ef4444";
    const barLabel = score === 3 ? "Strong" : score === 2 ? "Fair" : "Weak";

    return (
        <div style={{ marginTop: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ flex: 1, height: 3, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    <div style={{
                        height: "100%", borderRadius: 99,
                        width: `${(score / 3) * 100}%`,
                        background: barColor,
                        transition: "all 0.35s ease",
                    }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: barColor, fontFamily: "monospace", letterSpacing: "0.08em" }}>
                    {barLabel}
                </span>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {rules.map(r => (
                    <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            {r.met
                                ? <path d="M2 5l2.5 2.5L8 3" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                : <circle cx="5" cy="5" r="3.5" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                            }
                        </svg>
                        <span style={{ fontSize: 10, color: r.met ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>
                            {r.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SignUpPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [role, setRole] = useState("client"); // "client" | "freelancer"
    const [form, setForm] = useState({ name: "", email: "", imageUrl: "", password: "", skills: "", bio: "" });
    const router = useRouter();

    function set(field) {
        return (e) => setForm(f => ({ ...f, [field]: e.target.value }));
    }

    function validatePassword(pw) {
        if (pw.length < 6) return "Password must be at least 6 characters.";
        if (!/[A-Z]/.test(pw)) return "Password must contain at least one uppercase letter.";
        if (!/[a-z]/.test(pw)) return "Password must contain at least one lowercase letter.";
        return null;
    }

  

    async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.target);
    const name     = formData.get("name");
    const email    = formData.get("email");
    const imageUrl = formData.get("imageUrl");
    const password = formData.get("password");
    const role     = formData.get("role"); // "client" | "freelancer"
    const skillsRaw = formData.get("skills");
    const bio       = formData.get("bio");

    if (!name?.trim()) {
        setError("Full name is required.");
        setLoading(false);
        return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError("Enter a valid email address.");
        setLoading(false);
        return;
    }
    const pwErr = validatePassword(password);
    if (pwErr) {
        setError(pwErr);
        setLoading(false);
        return;
    }
    if (role === "freelancer" && !skillsRaw?.trim()) {
        setError("Skills are required for freelancer accounts.");
        setLoading(false);
        return;
    }

    const skills = role === "freelancer"
        ? (skillsRaw || "").split(",").map(s => s.trim()).filter(Boolean)
        : [];

    const { data, error } = await authClient.signUp.email({
        name,
        email,
        password,
        image: imageUrl || undefined,
        role,
        skills: skills.length > 0 ? skills.join(", ") : undefined, // better-auth expects string additional field
        bio: bio || undefined,
        onboardingComplete: true,
    });

    if (error) {
        setError(error.message || "Registration failed");
        setLoading(false);
        return;
    }

    // Redirect to role-specific dashboard
    const DASHBOARD_ROUTES = {
        client:     "/dashboard/client",
        freelancer: "/dashboard/freelancer",
        admin:      "/dashboard/admin",
    };

    router.push(DASHBOARD_ROUTES[role] ?? "/dashboard");
    // keep loading=true so button stays disabled during navigation
}

    async function handleGoogle() {
        setError("");
        try {
            await authClient.signIn.social({
                provider: "google",
                callbackURL: "/"
            });
        } catch (err) {
            console.error("Google signup error:", err);
            setError(err.message || "Failed to sign up with Google.");
        }
    }

    return (
        <>
            <style>{`
        .sp-root {
          min-height: 100vh;
          display: flex;
          flex-direction: row;
          background: #000;
          font-family: system-ui, -apple-system, sans-serif;
          overflow: hidden;
        }
        .sp-left {
  display: flex;
  flex: 0 0 50%;
  flex-direction: column;
  position: relative;
  padding: 150px 52px 48px;  
  overflow: hidden;
  background: linear-gradient(145deg,#0e0400 0%,#070200 55%,#000 100%);
  box-sizing: border-box;
}
.sp-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 150px 40px 48px;   
  background: #060200;
  position: relative;
  box-sizing: border-box;
  min-height: 100vh;
  overflow-y: auto;
}
@media (max-width: 639px) {
  .sp-root { flex-direction: column; }
  .sp-left  { flex: 0 0 auto; padding: 88px 20px 28px; }   /* was: 16px 20px 28px */
  .sp-right { min-height: auto; padding: 24px 20px 40px; }
}

        @keyframes ping  { 75%,100%{transform:scale(2.2);opacity:0} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        @keyframes shine { 0%{transform:translateX(-100%)} 55%{transform:translateX(100%)} 100%{transform:translateX(100%)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }

        input::placeholder { color: rgba(255,255,255,0.18); }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 40px #0a0200 inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff;
        }
        button { font-family: inherit; }

        .sp-google-btn:hover { background: rgba(255,255,255,0.085) !important; }
        .sp-submit-btn:hover:not(:disabled) {
          box-shadow: 0 0 30px rgba(255,77,0,0.48) !important;
          transform: scale(1.01);
        }
        .sp-submit-btn:active:not(:disabled) { transform: scale(0.98); }

        .role-card { cursor: pointer; transition: all 0.22s; }
        .role-card:hover { border-color: rgba(255,77,0,0.4) !important; }
      `}</style>

            <div className="sp-root">

                {/* ══════════════ LEFT — Map panel ══════════════ */}
                <div className="sp-left">

                    {/* Glow blobs */}
                    <div style={{ position: "absolute", top: "-15%", left: "-10%", width: "75%", height: "65%", background: "radial-gradient(ellipse at center,rgba(255,77,0,0.12) 0%,transparent 68%)", filter: "blur(52px)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: "0", right: "-5%", width: "55%", height: "45%", background: "radial-gradient(ellipse at center,rgba(255,77,0,0.06) 0%,transparent 70%)", filter: "blur(44px)", pointerEvents: "none" }} />

                    {/* Right border */}
                    <div style={{ position: "absolute", top: "8%", right: 0, width: 1, height: "84%", background: "linear-gradient(to bottom,transparent,rgba(255,77,0,0.18),transparent)" }} />

                    <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>


                        {/* Headline */}
                        <motion.div
                            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}
                            style={{ marginBottom: 32 }}
                        >
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 20, marginBottom: 14, background: "rgba(255,77,0,0.08)", border: "1px solid rgba(255,77,0,0.2)" }}>
                                <span style={{ position: "relative", display: "inline-block", width: 6, height: 6 }}>
                                    <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#ff4d00", opacity: 0.7, animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite" }} />
                                    <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#ff4d00" }} />
                                </span>
                                <span style={{ fontSize: 10, fontWeight: 700, color: "#ff4d00", letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "monospace" }}>
                                    Global talent network
                                </span>
                            </div>

                            <h1 style={{ fontSize: "clamp(1.6rem,2.4vw,2.3rem)", fontWeight: 900, color: "#fff", lineHeight: 1.06, letterSpacing: "-0.035em", margin: 0 }}>
                                Work flows across
                                <br />
                                <span style={{ background: "linear-gradient(135deg,#ff4d00,#ff8c42)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                                    every timezone.
                                </span>
                            </h1>
                            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.32)", marginTop: 10, lineHeight: 1.65 }}>
                                Clients and freelancers across 90+ countries trust Taskly to get work done.
                            </p>
                        </motion.div>

                        {/* World map */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.3 }}
                            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
                        >
                            {/* Map glow underlay */}
                            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center,rgba(255,77,0,0.06) 0%,transparent 70%)", pointerEvents: "none" }} />
                            <div style={{ width: "100%", maxWidth: 480, animation: "float 6s ease-in-out infinite" }}>
                                <WorldMapDots />
                            </div>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}
                            style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20, marginTop: 20 }}
                        >
                            {[
                                { value: "90+", label: "Countries" },
                                { value: "10k+", label: "Tasks Done" },
                                { value: "$2M+", label: "Paid Out" },
                            ].map((s, i, arr) => (
                                <div key={s.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none", padding: "0 6px" }}>
                                    <span style={{ fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>{s.value}</span>
                                    <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.28)", fontFamily: "monospace", letterSpacing: "0.09em", textTransform: "uppercase", marginTop: 3 }}>{s.label}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* ══════════════ RIGHT — Sign up form ══════════════ */}
                <div className="sp-right">

                    <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", height: 200, background: "radial-gradient(ellipse at 50% 0%,rgba(255,77,0,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />

                    <motion.div
                        initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        style={{ width: "100%", maxWidth: 400, position: "relative", zIndex: 1 }}
                    >

                        {/* Heading */}
                        <div style={{ marginBottom: 22 }}>
                            <h2 style={{ fontSize: 25, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", marginBottom: 5, lineHeight: 1.1 }}>
                                Create your account
                            </h2>
                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.65, margin: 0 }}>
                                Join thousands of clients and freelancers on Taskly.
                            </p>
                        </div>

                        {/* Google — always Client */}
                        <button
                            onClick={handleGoogle}
                            className="sp-google-btn"
                            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "12px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.11)", background: "rgba(255,255,255,0.045)", color: "rgba(255,255,255,0.82)", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 6, transition: "all 0.18s", letterSpacing: "-0.01em" }}
                        >
                            <GoogleIcon />
                            Continue with Google
                        </button>
                        <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.2)", textAlign: "center", margin: "0 0 16px", fontFamily: "monospace", letterSpacing: "0.04em" }}>
                            Google sign-up creates a Client account
                        </p>

                        {/* Divider */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
                            <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.2)", fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                                or sign up with email
                            </span>
                            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} noValidate>
                            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>

                                {/* Name */}
                                <InputField
                                    label="Full Name" name="name" type="text"
                                    placeholder="Aryan Kapoor" required
                                    value={form.name} onChange={set("name")}
                                />

                                {/* I want to — role selector directly under name */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.38)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "monospace" }}>
                                        I want to
                                    </span>
                                    <input type="hidden" name="role" value={role} />
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                        {[
                                            { val: "client", icon: <Person></Person>, title: "Hire talent", sub: "Post tasks & find freelancers" },
                                            { val: "freelancer", icon: <Display></Display>, title: "Find work", sub: "Bid on tasks & earn money" },
                                        ].map(opt => (
                                            <div
                                                key={opt.val}
                                                className="role-card"
                                                onClick={() => setRole(opt.val)}
                                                style={{
                                                    padding: "11px 12px", borderRadius: 10,
                                                    border: `1px solid ${role === opt.val ? "#ff4d00" : "rgba(255,255,255,0.09)"}`,
                                                    background: role === opt.val ? "rgba(255,77,0,0.07)" : "rgba(255,255,255,0.03)",
                                                    boxShadow: role === opt.val ? "0 0 0 3px rgba(255,77,0,0.10)" : "none",
                                                    transition: "all 0.22s",
                                                    userSelect: "none",
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                                                    <span style={{ fontSize: 16 }}>{opt.icon}</span>
                                                    {/* Radio dot */}
                                                    <div style={{ width: 14, height: 14, borderRadius: "50%", border: `1.5px solid ${role === opt.val ? "#ff4d00" : "rgba(255,255,255,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                        {role === opt.val && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ff4d00" }} />}
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: 12.5, fontWeight: 700, color: role === opt.val ? "#fff" : "rgba(255,255,255,0.6)", letterSpacing: "-0.01em" }}>{opt.title}</div>
                                                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.28)", marginTop: 2, lineHeight: 1.4 }}>{opt.sub}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {role === "freelancer" && (
                                        <p style={{ fontSize: 10.5, color: "rgba(255,77,0,0.6)", margin: 0, fontFamily: "monospace", letterSpacing: "0.03em" }}>
                                            ↳ Freelancer accounts require email sign-up
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <InputField
                                    label="Email" name="email" type="email"
                                    placeholder="you@example.com" required
                                    value={form.email} onChange={set("email")}
                                />

                                {/* Image URL */}
                                <InputField
                                    label="Profile Image URL" name="imageUrl" type="url"
                                    placeholder="https://example.com/avatar.jpg"
                                    value={form.imageUrl} onChange={set("imageUrl")}
                                    hint="Optional — paste a link to your profile photo"
                                />

                                {/* Skills (only for freelancer) */}
                                {role === "freelancer" && (
                                    <InputField
                                        label="Skills" name="skills" type="text"
                                        placeholder="React, Next.js, Node.js, CSS" required
                                        value={form.skills} onChange={set("skills")}
                                        hint="Enter your skills as a comma-separated list"
                                    />
                                )}

                                {/* Bio */}
                                <InputField
                                    label="Short Bio" name="bio" type="text"
                                    placeholder="Tell us a bit about yourself..."
                                    value={form.bio} onChange={set("bio")}
                                    hint="Optional — brief introduction"
                                />

                                {/* Password */}
                                <div>
                                    <InputField
                                        label="Password" name="password" type="password"
                                        placeholder="••••••••" required
                                        value={form.password} onChange={set("password")}
                                    />
                                    <PasswordStrength password={form.password} />
                                </div>

                            </div>

                            {/* Error */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: "auto" }}
                                        exit={{ opacity: 0, y: -6, height: 0 }}
                                        style={{ padding: "10px 14px", borderRadius: 8, marginTop: 14, background: "rgba(239,68,68,0.09)", border: "1px solid rgba(239,68,68,0.22)", color: "#fca5a5", fontSize: 12.5, display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}
                                    >
                                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                            <circle cx="6.5" cy="6.5" r="5.5" stroke="#fca5a5" strokeWidth="1.2" />
                                            <path d="M6.5 4v3" stroke="#fca5a5" strokeWidth="1.4" strokeLinecap="round" />
                                            <circle cx="6.5" cy="9" r="0.7" fill="#fca5a5" />
                                        </svg>
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="sp-submit-btn"
                                style={{
                                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                                    gap: 8, padding: "13px 20px", borderRadius: 10, border: "none",
                                    background: loading ? "rgba(255,77,0,0.45)" : "linear-gradient(135deg,#ff4d00 0%,#cc3d00 100%)",
                                    boxShadow: loading ? "none" : "0 0 20px rgba(255,77,0,0.3)",
                                    color: "#fff", fontSize: 14.5, fontWeight: 700,
                                    cursor: loading ? "not-allowed" : "pointer",
                                    marginTop: 16, transition: "all 0.2s",
                                    letterSpacing: "-0.01em", position: "relative", overflow: "hidden",
                                }}
                            >
                                {!loading && (
                                    <span style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.10) 50%,transparent 60%)", transform: "translateX(-100%)", animation: "shine 3.2s ease-in-out infinite" }} />
                                )}
                                {loading ? (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: "spin 0.75s linear infinite", flexShrink: 0 }}>
                                            <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
                                            <path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                        Creating account…
                                    </>
                                ) : (
                                    <>
                                        Create Account
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <path d="M2 7h10M8 3l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Login link */}
                        <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.28)", marginTop: 20 }}>
                            Already have an account?{" "}
                            <Link
                                href="/auth/login"
                                style={{ color: "#ff4d00", textDecoration: "none", fontWeight: 700 }}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.72")}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                            >
                                Log in →
                            </Link>
                        </p>

                        {/* Terms */}
                        <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.13)", marginTop: 14, lineHeight: 1.65 }}>
                            By creating an account you agree to our{" "}
                            <Link href="/terms" style={{ color: "rgba(255,255,255,0.28)", textDecoration: "underline" }}>Terms</Link>
                            {" "}&amp;{" "}
                            <Link href="/privacy" style={{ color: "rgba(255,255,255,0.28)", textDecoration: "underline" }}>Privacy Policy</Link>.
                        </p>

                    </motion.div>
                </div>
            </div>
        </>
    );
}