export function getSubjectQuery(branchCode: string, semNum: number, syllabus?: any) {
  let subjectQuery: any = { $or: [{ branches: branchCode, semesters: semNum }] };
  
  if (syllabus === "old" && (semNum === 1 || semNum === 2)) {
    const group1 = ["CSE", "IT", "ET&T"];
    const group2 = ["MECH", "CIVIL", "EE", "MINING"];
    const altSem = semNum === 1 ? 2 : 1;
    
    if (group1.includes(branchCode)) {
      subjectQuery.$or.push({ branches: { $in: group2 }, semesters: altSem, syllabus: "old" });
    } else if (group2.includes(branchCode)) {
      subjectQuery.$or.push({ branches: { $in: group1 }, semesters: altSem, syllabus: "old" });
    }
  }

  if (syllabus === "new" || syllabus === "old") {
    return { $and: [subjectQuery, { syllabus }] };
  }
  
  return subjectQuery;
}

export function getUniqueSubjects(subjects: any[]) {
  const unique = [];
  const seen = new Set();
  for (const sub of subjects) {
    if (!seen.has(sub.name)) {
      seen.add(sub.name);
      unique.push(sub);
    }
  }
  return unique;
}

