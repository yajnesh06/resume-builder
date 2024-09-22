import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon, TrashIcon } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const fonts = ['Arial', 'Garamond', 'Times New Roman', 'Roboto', 'Courier', 'Helvetica', 'Verdana',]
const fontSizes = ['12', '14', '16', '18','20', '22','24']

const initialResumeData = {
  personalInfo: { name: '', email: '', phone: '', location: '', linkedin: '', website: '' },
  objective: '',
  education: [{ degree: '', institution: '', year: '' }],
  skills: { technical: '', soft: '', other: '' },
  experience: [{ role: '', company: '', duration: '', location: '', achievements: [''] }],
  projects: [{ title: '', description: '',links:'' }],
  extraCurricular: [''],
  leadership: [''],
  customSections: []
}

export default function Component() {
  const [resumeData, setResumeData] = useState(initialResumeData)
  const [selectedFont, setSelectedFont] = useState('Arial')
  const [selectedFontSize, setSelectedFontSize] = useState('12')
  const resumePreviewRef = useRef(null)

  const handlePersonalInfoChange = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }))
  }

  const handleChange = (section, index, field, value) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const handleArrayChange = (section, index, value) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => i === index ? value : item)
    }))
  }

  const handleAchievementChange = (expIndex, achIndex, value) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === expIndex 
          ? { ...exp, achievements: exp.achievements.map((ach, j) => j === achIndex ? value : ach) }
          : exp
      )
    }))
  }

  const addItem = (section) => {
    setResumeData(prev => ({
      ...prev,
      [section]: [...prev[section], section === 'education' ? { degree: '', institution: '', year: '' } 
                                  : section === 'experience' ? { role: '', company: '', duration: '', location: '', achievements: [''] }
                                  : section === 'projects' ? { title: '', description: '' ,links:''}
                                  : '']
    }))
  }

  const addAchievement = (index) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, achievements: [...exp.achievements, ''] } : exp
      )
    }))
  }

  const removeItem = (section, index) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }))
  }

  const removeAchievement = (expIndex, achIndex) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === expIndex 
          ? { ...exp, achievements: exp.achievements.filter((_, j) => j !== achIndex) }
          : exp
      )
    }))
  }

  const deleteSection = (section) => {
    setResumeData(prev => ({
      ...prev,
      [section]: section === 'skills' ? { technical: '', soft: '', other: '' } : []
    }))
  }

  const addCustomSection = () => {
    setResumeData(prev => ({
      ...prev,
      customSections: [...prev.customSections, { title: '', fields: [{ name: '', value: '' }] }]
    }))
  }

  const handleCustomSectionChange = (index, field, value) => {
    setResumeData(prev => ({
      ...prev,
      customSections: prev.customSections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }))
  }

  const addCustomField = (sectionIndex) => {
    setResumeData(prev => ({
      ...prev,
      customSections: prev.customSections.map((section, i) => 
        i === sectionIndex ? { ...section, fields: [...section.fields, { name: '', value: '' }] } : section
      )
    }))
  }

  const handleCustomFieldChange = (sectionIndex, fieldIndex, field, value) => {
    setResumeData(prev => ({
      ...prev,
      customSections: prev.customSections.map((section, i) => 
        i === sectionIndex ? {
          ...section,
          fields: section.fields.map((f, j) => 
            j === fieldIndex ? { ...f, [field]: value } : f
          )
        } : section
      )
    }))
  }

  const removeCustomField = (sectionIndex, fieldIndex) => {
    setResumeData(prev => ({
      ...prev,
      customSections: prev.customSections.map((section, i) => 
        i === sectionIndex ? {
          ...section,
          fields: section.fields.filter((_, j) => j !== fieldIndex)
        } : section
      )
    }))
  }

  const generatePDF = () => {
    const input = resumePreviewRef.current;
    if (!input) {
      console.error("Resume preview element not found");
      return;
    }
  
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Moderately increase scale for better quality while keeping file size lower
    const scale = 2; 
  
    // Render canvas
    html2canvas(input, {
      scale: scale,
      useCORS: true,      // Ensure cross-origin images are rendered correctly
      allowTaint: false,  // Disable taint to avoid corrupted images
      scrollY: -window.scrollY,
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png'); // Stick with PNG for higher quality
  
      // Calculate image dimensions and positioning
      const imgWidth = canvas.width / scale;
      const imgHeight = canvas.height / scale;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;
  
      // Add image with compression using 'SLOW' for better balance of quality and size
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio, undefined, 'SLOW');
  
      // Save PDF with moderate compression
      pdf.save('resume.pdf');
    });
  };
  

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="w-full md:w-1/2 p-4 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Resume Builder</h1>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.keys(resumeData.personalInfo).map((field) => (
                  <div key={field}>
                    <Label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                    <Input 
                      id={field} 
                      value={resumeData.personalInfo[field]} 
                      onChange={(e) => handlePersonalInfoChange(field, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Objective</span>
                <Button variant="destructive" size="sm" onClick={() => deleteSection('objective')}>
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete Section
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={resumeData.objective} 
                onChange={(e) => setResumeData(prev => ({ ...prev, objective: e.target.value }))}
              />
            </CardContent>
          </Card>

          <Card>
  <CardHeader>
    <CardTitle className="flex justify-between items-center">
      <span>Education</span>
      <Button variant="destructive" size="sm" onClick={() => deleteSection('education')}>
        <TrashIcon className="w-4 h-4 mr-2" />
        Delete Section
      </Button>
    </CardTitle>
  </CardHeader>
  <CardContent>
    {resumeData.education.map((edu, index) => (
      <div key={index} className="mb-4 p-4 border rounded">
        <div className="space-y-4">
          <div className="mb-2">
            <Label htmlFor={`edu-degree-${index}`}>Degree</Label>
            <Input 
              id={`edu-degree-${index}`} 
              value={edu.degree} 
              onChange={(e) => handleChange('education', index, 'degree', e.target.value)}
            />
          </div>
          <div className="mb-2">
            <Label htmlFor={`edu-institution-${index}`}>Institution</Label>
            <Input 
              id={`edu-institution-${index}`} 
              value={edu.institution} 
              onChange={(e) => handleChange('education', index, 'institution', e.target.value)}
            />
          </div>
          <div className="mb-2">
            <Label htmlFor={`edu-year-${index}`}>Year</Label>
            <Input 
              id={`edu-year-${index}`} 
              value={edu.year} 
              onChange={(e) => handleChange('education', index, 'year', e.target.value)}
            />
          </div>
        </div>
        <Button variant="destructive" size="sm" className="mt-2" onClick={() => removeItem('education', index)}>
          <TrashIcon className="w-4 h-4 mr-2" />
          Remove
        </Button>
      </div>
    ))}
    <Button onClick={() => addItem('education')}>
      <PlusIcon className="w-4 h-4 mr-2" />
      Add Education
    </Button>
  </CardContent>
</Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Skills</span>
                <Button variant="destructive" size="sm" onClick={() => deleteSection('skills')}>
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete Section
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.keys(resumeData.skills).map((field) => (
                  <div key={field}>
                    <Label htmlFor={`skill-${field}`}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                    <Input 
                      id={`skill-${field}`} 
                      value={resumeData.skills[field]} 
                      onChange={(e) => setResumeData(prev => ({ ...prev, skills: { ...prev.skills, [field]: e.target.value } }))}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Experience</span>
                <Button variant="destructive" size="sm" onClick={() => deleteSection('experience')}>
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete Section
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {resumeData.experience.map((exp, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <div className="space-y-4">
                    {Object.keys(exp).filter(k => k !== 'achievements').map((field) => (
                      <div key={field}>
                        <Label htmlFor={`exp-${field}-${index}`}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                        <Input 
                          id={`exp-${field}-${index}`} 
                          value={exp[field]} 
                          onChange={(e) => handleChange('experience', index, field, e.target.value)}
                        />
                      </div>
                    ))}
                    <div>
                      <Label>Achievements</Label>
                      {exp.achievements.map((ach, achIndex) => (
                        <div key={achIndex} className="flex items-center mb-2">
                          <Input 
                            value={ach} 
                            onChange={(e) => handleAchievementChange(index, achIndex, e.target.value)}
                            className="mr-2"
                          />
                          <Button variant="destructive" size="sm" onClick={() => removeAchievement(index, achIndex)}>
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button size="sm" onClick={() => addAchievement(index)}>
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Achievement
                      </Button>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" className="mt-2" onClick={() => removeItem('experience', index)}>
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Remove Experience
                  </Button>
                </div>
              ))}
              <Button onClick={() => addItem('experience')}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Projects</span>
                <Button variant="destructive" size="sm" onClick={() => deleteSection('projects')}>
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete Section
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {resumeData.projects.map((project, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`project-title-${index}`}>Title</Label>
                      <Input 
                        id={`project-title-${index}`} 
                        value={project.title}
                        onChange={(e) => handleChange('projects', index, 'title', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`project-description-${index}`}>Description</Label>
                      <Textarea 
                        id={`project-description-${index}`}
                        value={project.description}
                        onChange={(e) => handleChange('projects', index, 'description', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`project-links-${index}`}>Links</Label>
                      <Textarea 
                        id={`project-links-${index}`}
                        value={project.links}
                        onChange={(e) => handleChange('projects', index, 'links', e.target.value)}
                      />
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" className="mt-2" onClick={() => removeItem('projects', index)}>
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Remove Project
                  </Button>
                </div>
              ))}
              <Button onClick={() => addItem('projects')}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Extra-Curricular Activities</span>
                <Button variant="destructive" size="sm" onClick={() => deleteSection('extraCurricular')}>
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete Section
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {resumeData.extraCurricular.map((activity, index) => (
                <div key={index} className="flex items-center mb-2">
                  <Input 
                    value={activity} 
                    onChange={(e) => handleArrayChange('extraCurricular', index, e.target.value)}
                    className="mr-2"
                  />
                  <Button variant="destructive" size="sm" onClick={() => removeItem('extraCurricular', index)}>
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={() => addItem('extraCurricular')}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Leadership</span>
                <Button variant="destructive" size="sm" onClick={() => deleteSection('leadership')}>
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete Section
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {resumeData.leadership.map((item, index) => (
                <div key={index} className="flex items-center mb-2">
                  <Input 
                    value={item} 
                    onChange={(e) => handleArrayChange('leadership', index, e.target.value)}
                    className="mr-2"
                  />
                  <Button variant="destructive" size="sm" onClick={() => removeItem('leadership', index)}>
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={() => addItem('leadership')}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Leadership Item
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Sections</CardTitle>
            </CardHeader>
            <CardContent>
              {resumeData.customSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-4 p-4 border rounded">
                  <Input
                    placeholder="Section Title"
                    value={section.title}
                    onChange={(e) => handleCustomSectionChange(sectionIndex, 'title', e.target.value)}
                    className="mb-2"
                  />
                  {section.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className="flex items-center mb-2">
                      <Input
                        placeholder="Field Name"
                        value={field.name}
                        onChange={(e) => handleCustomFieldChange(sectionIndex, fieldIndex, 'name', e.target.value)}
                        className="mr-2"
                      />
                      <Input
                        placeholder="Field Value"
                        value={field.value}
                        onChange={(e) => handleCustomFieldChange(sectionIndex, fieldIndex, 'value', e.target.value)}
                        className="mr-2"
                      />
                      <Button variant="destructive" size="sm" onClick={() => removeCustomField(sectionIndex, fieldIndex)}>
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button size="sm" onClick={() => addCustomField(sectionIndex)}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Field
                  </Button>
                </div>
              ))}
              <Button onClick={addCustomSection}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Custom Section
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Font Settings</CardTitle>
            </CardHeader>
            <CardContent className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="font-select">Font</Label>
                <Select onValueChange={setSelectedFont} defaultValue={selectedFont}>
                  <SelectTrigger id="font-select">
                    <SelectValue placeholder="Select a font" />
                  </SelectTrigger>
                  <SelectContent>
                    {fonts.map((font) => (
                      <SelectItem key={font} value={font}>{font}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="font-size-select">Font Size</Label>
                <Select onValueChange={setSelectedFontSize} defaultValue={selectedFontSize}>
                  <SelectTrigger id="font-size-select">
                    <SelectValue placeholder="Select a font size" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontSizes.map((size) => (
                      <SelectItem key={size} value={size}>{size}px</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button onClick={generatePDF}>Generate PDF</Button>
        </div>
      </div>

      <div className="w-full md:w-1/2 p-2 bg-gray-100 overflow-y-auto">
        
          <div>
            <p className='text-center py-4 text-3xl font-bold  justify-contents'>Resume Preview</p>
          </div>
          <CardContent>
            <div id="resume-preview" ref={resumePreviewRef} className=" bg-white roun p-6 m-5 shadow-lg" style={{ fontFamily: selectedFont, fontSize: `${selectedFontSize}px`, width: '210mm', minHeight: '297mm', margin: '0 auto' ,transform: 'scale(0.9)', transformOrigin: 'top left'  }}>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold uppercase">{resumeData.personalInfo.name}</h1>
                <p className="break-words">{resumeData.personalInfo.phone} • {resumeData.personalInfo.location}</p>
                <p className="break-words">{resumeData.personalInfo.email} • {resumeData.personalInfo.linkedin} • {resumeData.personalInfo.website}</p>
              </div>

              {resumeData.objective && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">OBJECTIVE</h2>
                  <div className="border-t border-gray-300 pt-2">
                    <p className="whitespace-pre-wrap break-words">{resumeData.objective}</p>
                  </div>
                </div>
              )}

{resumeData.education.length > 0 && (
  <div className="mb-6">
    <h2 className="text-lg font-semibold mb-2">EDUCATION</h2>
    <div className="border-t border-gray-300 pt-2">
      {resumeData.education.map((edu, index) => (
        <div key={index} className="mb-2">
          <div className="flex justify-between">
            <div className="break-words mb-1">
              <strong>{edu.degree}</strong>
            </div>
            <div className="break-words mb-1 text-right">
              {edu.year}
            </div>
          </div>
          <div className="break-words mb-1">
            {edu.institution}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

              {(resumeData.skills.technical || resumeData.skills.soft || resumeData.skills.other) && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">SKILLS</h2>
                  <div className="border-t border-gray-300 pt-2">
                    {resumeData.skills.technical && <p className="break-words mb-1"><strong>Technical Skills:</strong> {resumeData.skills.technical}</p>}
                    {resumeData.skills.soft && <p className="break-words mb-1"><strong>Soft Skills:</strong> {resumeData.skills.soft}</p>}
                    {resumeData.skills.other && <p className="break-words"><strong>Other:</strong> {resumeData.skills.other}</p>}
                  </div>
                </div>
              )}

              {resumeData.experience.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">EXPERIENCE</h2>
                  <div className="border-t border-gray-300 pt-2">
                    {resumeData.experience.map((exp, index) => (
                      <div key={index} className="mb-4">
                        <div className="flex flex-wrap justify-between mb-1">
                          <strong className="break-words">{exp.role}</strong>
                          <span className="break-words">{exp.duration}</span>
                        </div>
                        <div className="flex flex-wrap justify-between mb-2">
                          <span className="break-words">{exp.company}</span>
                          <span className="break-words">{exp.location}</span>
                        </div>
                        <ul className="list-disc list-outside pl-5">
                          {exp.achievements.map((ach, achIndex) => (
                            <li key={achIndex} className="break-words mb-1">{ach}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resumeData.projects.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">PROJECTS</h2>
                  <div className="border-t border-gray-300 pt-2">
                    {resumeData.projects.map((project, index) => (
                      <div key={index} className="mb-3">
                        <strong className="break-words">{project.title}</strong>
                        <p className="whitespace-pre-wrap break-words">{project.description}</p>
                        <p className="whitespace-pre-wrap break-words">{project.links}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resumeData.extraCurricular.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">EXTRA-CURRICULAR ACTIVITIES</h2>
                  <div className="border-t border-gray-300 pt-2">
                    <ul className="list-disc list-outside pl-5">
                      {resumeData.extraCurricular.map((activity, index) => (
                        <li key={index} className="break-words mb-1">{activity}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {resumeData.leadership.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">LEADERSHIP</h2>
                  <div className="border-t border-gray-300 pt-2">
                    <ul className="list-disc list-outside pl-5">
                      {resumeData.leadership.map((item, index) => (
                        <li key={index} className="break-words mb-1">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {resumeData.customSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">{section.title.toUpperCase()}</h2>
                  <div className="border-t border-gray-300 pt-2">
                    {section.fields.map((field, fieldIndex) => (
                      <p key={fieldIndex} className="break-words mb-1"><strong>{field.name}:</strong> {field.value}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        
      </div>
    </div>
  )
}