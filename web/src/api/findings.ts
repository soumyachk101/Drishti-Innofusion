export async function fetchFindings(orgId: string) {
 const res = await fetch(`/api/v1/findings?org_id=${orgId}`);
 if (!res.ok) throw new Error('Failed to fetch findings');
 return res.json();
}
