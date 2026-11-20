import { User } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BusinessProfile, CatalogItem, Quote, QuoteStatus } from "@/types/quote";

export function createEmptyBusinessProfile(user: User): BusinessProfile {
  return {
    name: user.displayName ? `${user.displayName}` : "Mi Empresa",
    tagline: "",
    phone: "",
    email: user.email || "",
    address: "",
    currency: "USD",
    taxLabel: "IVA",
    taxPercent: 13,
    validityDays: 15,
    defaultNotes: "",
  };
}

function stripUndefined<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

export async function loadUserWorkspace(user: User): Promise<{
  business: BusinessProfile;
  catalog: CatalogItem[];
  quotes: Quote[];
}> {
  const fallbackBusiness = createEmptyBusinessProfile(user);
  if (!db) {
    return { business: fallbackBusiness, catalog: [], quotes: [] };
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  let business = fallbackBusiness;
  if (userSnap.exists() && userSnap.data()?.business) {
    business = {
      ...fallbackBusiness,
      ...(userSnap.data().business as Partial<BusinessProfile>),
    };
  } else {
    // Initialize clean user profile document in Firestore on first sign-in
    await setDoc(
      userRef,
      {
        email: user.email || "",
        displayName: user.displayName || "",
        business: stripUndefined(fallbackBusiness),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  const catalogSnap = await getDocs(collection(db, "users", user.uid, "catalog"));
  const catalog: CatalogItem[] = catalogSnap.docs.map((d) => ({
    ...(d.data() as CatalogItem),
    id: d.id,
  }));

  const quotesQuery = query(
    collection(db, "users", user.uid, "quotes"),
    orderBy("createdAt", "desc")
  );
  const quotesSnap = await getDocs(quotesQuery);
  const quotes: Quote[] = quotesSnap.docs.map((d) => ({
    ...(d.data() as Quote),
    id: d.id,
  }));

  return { business, catalog, quotes };
}

export async function saveUserBusiness(
  uid: string,
  business: BusinessProfile
): Promise<void> {
  if (!db) return;
  await setDoc(
    doc(db, "users", uid),
    {
      business: stripUndefined(business),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function syncUserCatalog(
  uid: string,
  prevCatalog: CatalogItem[],
  nextCatalog: CatalogItem[]
): Promise<void> {
  if (!db) return;
  const batch = writeBatch(db);
  const nextIds = new Set(nextCatalog.map((c) => c.id));

  for (const prev of prevCatalog) {
    if (!nextIds.has(prev.id)) {
      batch.delete(doc(db, "users", uid, "catalog", prev.id));
    }
  }

  for (const item of nextCatalog) {
    batch.set(
      doc(db, "users", uid, "catalog", item.id),
      stripUndefined(item),
      { merge: true }
    );
  }

  await batch.commit();
}

export async function saveUserQuote(uid: string, quote: Quote): Promise<void> {
  if (!db) return;
  await setDoc(
    doc(db, "users", uid, "quotes", quote.id),
    {
      ...stripUndefined(quote),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function updateUserQuoteStatus(
  uid: string,
  quoteId: string,
  status: QuoteStatus
): Promise<void> {
  if (!db) return;
  await setDoc(
    doc(db, "users", uid, "quotes", quoteId),
    {
      status,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function deleteUserQuote(uid: string, quoteId: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, "users", uid, "quotes", quoteId));
}

export async function clearUserWorkspace(
  uid: string,
  user: User,
  catalog: CatalogItem[],
  quotes: Quote[]
): Promise<BusinessProfile> {
  const cleanBusiness = createEmptyBusinessProfile(user);
  if (!db) return cleanBusiness;

  const batch = writeBatch(db);
  for (const c of catalog) {
    batch.delete(doc(db, "users", uid, "catalog", c.id));
  }
  for (const q of quotes) {
    batch.delete(doc(db, "users", uid, "quotes", q.id));
  }
  batch.set(
    doc(db, "users", uid),
    {
      business: stripUndefined(cleanBusiness),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  await batch.commit();
  return cleanBusiness;
}
