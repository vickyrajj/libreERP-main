def blogDetails(request, blogname):
    print '*****************',blogname
    try:
        print "searching for blog post"
        print blogPost.objects.all()
        blogobj = blogPost.objects.get(shortUrl=blogname)
        print "got blog post"  , blogobj

        if blogobj.contentType == 'book':
            book = Book.objects.get(pk=blogobj.header)
            sectionobj = Section.objects.filter(book = book.pk)
            return render(request, 'book.html', {"home": False, "tagsCSV" :  blogobj.tagsCSV.split(','), 'book' : book ,'sectionobj':sectionobj,'blogobj' : blogobj, "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})
    except:

        traceback.print_exc(file=sys.stdout)


        sectionobj = Section.objects.get(shortUrl=filename)
        blogobj = blogPost.objects.get(header=sectionobj.book.pk)
        print 'boookkkkkk',sectionobj.book
        sec = sectionobj.book.sections.order_by('sequence')
        prev = False
        nxt = False
        prevobj={}
        nxtvobj={}
        for a,i in enumerate(sec):
            print i.shortUrl , a
            if i.pk == sectionobj.pk:
                if len(sec) > 1:
                    if a == 0:
                        nxt = True
                        nxtvobj = sec[1]
                        print 'nxt',nxtvobj.shortUrl
                    elif a == len(sec)-1:
                        prev = True
                        prevobj = sec[a-1]
                        print 'prev',prevobj.shortUrl
                    else:
                        prev = True
                        nxt = True
                        prevobj = sec[a-1]
                        nxtvobj = sec[a+1]

        return render(request, 'bookContent.html', { "sections" : sec , "home": False, "tagsCSV" :  blogobj.tagsCSV.split(','),'sectionobj':sectionobj, 'book' : sectionobj.book ,'blogobj' : blogobj, "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT,'questions':sectionobj.questions.all(),'bot':{'prev':prev,'nxt':nxt,'prevobj':prevobj,'nxtvobj':nxtvobj}})
