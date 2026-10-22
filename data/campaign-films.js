// Supplied campaign films. Add future films here; missing slots are not substitute media.
const film=(id,title,sourceFilename)=>({id,title,sourceFilename,src:`/public/campaign-films/${id}.mp4`,poster:`/public/campaign-films/${id}.webp`,width:720,height:1280});
export const campaignFilms={
 'elan-bakery':{theme:'elan',name:'ELAN PÂTISSERIE',description:'Cream, cocoa and a little theatre.',films:[film('elan-01','The first bite','elan ad 1 .mp4'),film('elan-02','A sweeter ritual','elan ad 2.mp4'),film('elan-03','Made to be desired','elan ad video 3.mp4')],missing:[]},
 'salt-and-silk':{theme:'salt',name:'SALT & SILK',description:'Chocolate, treated like couture.',films:[film('salt-silk-02','A study in indulgence','salt and silk video 2.mp4')],missing:['Salt & Silk — additional campaign 01.mp4','Salt & Silk — additional campaign 03.mp4']},
 'sable-glass-studio':{theme:'sable',name:'SABLE GLASS STUDIO',description:'Light becomes the object.',films:[film('sable-01','Amber in motion','sable video 1.mp4')],missing:['Sable — additional campaign 02.mp4','Sable — additional campaign 03.mp4']},
 'casa-mirador':{theme:'casa',name:'CASA MIRADOR',description:'An atmosphere, made tangible.',films:[film('casa-01','The courtyard','casa video 1.mp4')],missing:[]}
};
