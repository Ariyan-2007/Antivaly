using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public class CategoryRepo: IRepository<Category, string>
    {
        AntivalyEntities db;

        public CategoryRepo(AntivalyEntities db)
        {
            this.db = db;
        }

        public void Add(Category e)
        {
            this.db.Categories.Add(e);
            this.db.SaveChanges();
        }

        public void Delete(string id)
        {
            var category = db.Categories.FirstOrDefault(c => c.CatName == id);
            db.Categories.Remove(category);
            db.SaveChanges();
        }

        public void Edit(Category e)
        {
            var u = db.Categories.FirstOrDefault(en => en.CatID == e.CatID);
            db.Entry(u).CurrentValues.SetValues(e);
            db.SaveChanges();
        }

        public List<Category> Get()
        {
            return db.Categories.ToList();
        }

        public Category Get(string id)
        {
            return db.Categories.FirstOrDefault(c => c.CatName == id);
        }
    }
}
