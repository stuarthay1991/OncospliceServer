const cancerToTissueMap = {
    "PCPG": "Adrenal Gland",
    "KIRC": "Kidney",
    "CESC": "Cervix",
    "BLCA": "Bladder",
    "PRAD": "Prostate",
    "UCEC": "Uterus",
    "SARC": "Bone",
    "KICH": "Kidney",
    "LUAD": "Lung",
    "STAD": "Stomach",
    "LIHC": "Liver",
    "PAAD": "Pancreas",
    "BRCA": "Breast",
    "THCA": "Thyroid",
    "OV": "Ovary",
    "READ": "Rectum",
    "GBM": "Brain",
    "LGG": "Brain",
    "COAD": "Colon",
    "SKCM": "Skin",
    "TGCT": "Joints",
    "HNSC": "Head and Neck",
    "ESCA": "Esophagus"    
}

const tissueToCancerMap = {
    "Adrenal Gland": ["PCPG"],
    "Colorectal": ["COAD", "READ"],
    "Brain": ["GBM", "LGG"],
    "Kidney": ["KIRC", "KICH"],
    "Bladder": ["BLCA"],
    "Cervix": ["CESC"],
    "Prostate": ["PRAD"],
    "Uterus": ["UCEC"],
    "Bone": ["SARC"],
    "Lung": ["LUAD"],
    "Stomach": ["STAD"],
    "Liver": ["LIHC"],
    "Pancreas": ["PAAD"],
    "Breast": ["BRCA"],
    "Thyroid": ["THCA"],
    "Ovary": ["OV"],
    "Skin": ["SKCM"],
    "Joints": ["TGCT"],
    "Head and Neck": ["HNSC"],
    "Esophagus": ["ESCA"]  
}

module.exports.cancerToTissueMap = cancerToTissueMap;
module.exports.tissueToCancerMap = tissueToCancerMap;