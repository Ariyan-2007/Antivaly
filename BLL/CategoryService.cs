using AutoMapper;
using BEL;
using DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class CategoryService
    {
        static CategoryService()
        {
            Mapper.Initialize(cfg =>
            {
                cfg.CreateMap<Category, CategoryModel>().ReverseMap();
                cfg.CreateMap<Coupon, CouponModel>().ReverseMap();
                cfg.CreateMap<User, UserModel>().ReverseMap();
                cfg.CreateMap<UserID, UserIdModel>().ReverseMap();
                cfg.CreateMap<Token, TokenModel>().ReverseMap();
                cfg.CreateMap<Delivery, DeliveryModel>().ReverseMap();
                cfg.CreateMap<Transaction, TransactionModel>().ReverseMap();
                cfg.CreateMap<Product, ProductModel>().ReverseMap();
            });
        }
        public static void Create(CategoryModel b)
        {
            var data = Mapper.Map<Category>(b);
            DataSupplier.CategoryDataAccess().Add(data);
        }

        public static void Edit(CategoryModel b)
        {
            var data = Mapper.Map<Category>(b);
            DataSupplier.CategoryDataAccess().Edit(data);
        }

        public static void Delete(string id)
        {
            DataSupplier.CategoryDataAccess().Delete(id);
        }

        public static List<CategoryModel> Get()
        {
            var data = Mapper.Map<List<CategoryModel>>(DataSupplier.CategoryDataAccess().Get());
            return data;
        }
        public static CategoryModel Get(string id)
        {
            var data = Mapper.Map<CategoryModel>(DataSupplier.CategoryDataAccess().Get(id));
            return data;
        }
    }
}
