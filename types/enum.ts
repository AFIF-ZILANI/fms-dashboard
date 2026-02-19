import { EventType, Units } from "@/app/generated/prisma/enums";

export const UnitTypeArr = Object.values(Units);
export const EventTypeArr = Object.values(EventType);
export enum HouseEventEnum {
    FEED = "FEED",
    WATER = "WATER",
    MORTALITY = "MORTALITY",
}

export enum HouseEventUnitEnum {
    KG = "KG",
    BIRD = "BIRD",
    BAG = "BAG",
    LITER = "LITER",
}

export enum MedicineUnit {
    ML = "ML",
    L = "L",
    G = "G",
    KG = "KG",
    PCS = "PCS",
    VIAL = "VIAL",
    DOSE = "DOSE",
}

export enum MedicineCategory {
    MEDICINE = "MEDICINE",
    SUPPLEMENT = "SUPPLEMENT",
    VACCINE = "VACCINE",
}

export enum MedicineForm {
    LIQUID = "LIQUID",
    POWDER = "POWDER",
    TABLET = "TABLET",
}

export enum MedicineRoute {
    WATER = "WATER",
    INJECTION = "INJECTION",
    ORAL = "ORAL",
}

export enum StorageCondition {
    ROOM = "ROOM",
    REFRIGERATOR = "REFRIGERATOR",
    FREEZER = "FREEZER",
    OTHER = "OTHER",
}