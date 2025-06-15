
import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

const SKILLS = [
  { name: "Plumbing" },
  { name: "Electrical" },
  { name: "Cleaning" },
  { name: "Handyman" },
  { name: "Moving" },
];

const CATEGORIES = [
  { name: "Home" },
  { name: "Auto" },
  { name: "Electronics" },
  { name: "Personal" },
];

export default function OnboardingProviderSkillsStep() {
  const [skills, setSkills] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  function toggleSkill(skill: string) {
    setSkills(s =>
      s.includes(skill) ? s.filter(x => x !== skill) : [...s, skill]
    );
  }

  function toggleCategory(category: string) {
    setCategories(c =>
      c.includes(category) ? c.filter(x => x !== category) : [...c, category]
    );
  }

  return (
    <div className="flex flex-col gap-8 items-center">
      <div>
        <h2 className="text-xl font-semibold mb-2">Choose your main skills</h2>
        <div className="flex gap-4 flex-wrap">
          {SKILLS.map(skill => (
            <label key={skill.name} className="flex items-center gap-2">
              <Checkbox checked={skills.includes(skill.name)} onCheckedChange={() => toggleSkill(skill.name)} />
              <span>{skill.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-lg font-medium mb-2">Categories</h2>
        <div className="flex gap-4 flex-wrap">
          {CATEGORIES.map(category => (
            <label key={category.name} className="flex items-center gap-2">
              <Checkbox checked={categories.includes(category.name)} onCheckedChange={() => toggleCategory(category.name)} />
              <span>{category.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
