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
                cfg.CreateMap<Category, CategoryModel>();
                cfg.CreateMap<CategoryModel, Category>();
                cfg.CreateMap<Coupon, CouponModel>();
                cfg.CreateMap<CouponModel, Coupon>();
                cfg.CreateMap<User, UserModel>();
                cfg.CreateMap<UserModel, User>();
                cfg.CreateMap<UserID, UserIdModel>();
                cfg.CreateMap<UserIdModel, UserID>();
                cfg.CreateMap<Token, TokenModel>();
                cfg.CreateMap<TokenModel, Token>();
                cfg.CreateMap<Delivery, DeliveryModel>();
                cfg.CreateMap<DeliveryModel, Delivery>();
                cfg.CreateMap<Transaction, TransactionModel>();
                cfg.CreateMap<TransactionModel, Transaction>();
                cfg.CreateMap<Product, ProductModel>();
                cfg.CreateMap<ProductModel, Product>();
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
